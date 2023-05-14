const firebaseConfig = {
  apiKey: "AIzaSyB23hKMvxSfDpvpbHj9HQK-K6zBb2zDhGc",
  authDomain: "todo1-7afd2.firebaseapp.com",
  projectId: "todo1-7afd2",
  storageBucket: "todo1-7afd2.appspot.com",
  messagingSenderId: "271205919645",
  appId: "1:271205919645:web:6eb6ce29cc58ad02569d74"
};
//min firebase detaljer

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Lager en referanse til databasen
let db = firebase.firestore();

// Velger HTML-elementer fra DOM-en og lagrer dem i variabler
const usersSelect = document.getElementById("users");
const taskSelect = document.getElementById("tasks");
const regButton = document.getElementById("btnRegister");
const yearSelect = document.getElementById("year");
const monthSelect = document.getElementById("month");
const divReport = document.getElementById("detail-report");

// Oppretter tre JavaScript Maps for å holde data om brukere, oppgaver og familiepoeng
const users = new Map();
const tasks = new Map();
const familyPoints = new Map();
// Oppretter en tom log array som vi kan legge data til senere
const log = [];

// Kaller på main() funksjonen, som starter programmet
main();

// Definerer main() funksjonen, som er hovedfunksjonen i programmet
async function main() {
    // Henter data fra et API og lagrer det i en variabel ved hjelp av await
  const data = await fetchData()
    // Fyller opp brukerliste ved hjelp av data fra API
  populateFamilyMembers(users);
    // Fyller opp oppgaveliste ved hjelp av data fra API
  populateTasks(tasks);
    // Genererer en tabell basert på familiepoeng og legger den til i HTML
  table = generateTable(familyPoints );
  divReport.innerHTML= "";
  divReport.appendChild(table);
}

// Henter HTML-elementer
async function fetchData() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
   
    // henter familie medlemmer
    const usersSnapshot = await db.collection('users').get();
      usersSnapshot.forEach((doc) => {
      users.set(doc.data().id, doc.data().name);
      familyPoints.set(doc.data().name, 0);
    });
  
    // henter oppgaver fra tasks collection
    const taskSnapshot = await db.collection('Task').get();
    taskSnapshot.forEach((doc) => {
      tasks.set(doc.data().id, { name: doc.data().name, points: doc.data().points });
    });

    
  
    // henter hva som er gjort
    const logSnapshot = await db.collection('done')
      //.where('date', '>=', new Date(currentYear, currentMonth - 1, 1))
      //.where('date', '<', new Date(currentYear, currentMonth, 1))
      .get();
  
      
      // Itererer gjennom logSnapshot-objektet og utfører følgende for hvert element:
      logSnapshot.forEach((doc) => {
        // Logger ut data for elementet i konsollen
        console.log(doc.data());
        // Henter ut idUser, idTask og dato fra elementet og konverterer disse til heltall
        const idUser = parseInt(doc.data().idUser);
        const idTask = parseInt(doc.data().idTask);
        const date = doc.data().date;
        // Prøver å hente ut antall poeng og navnet på oppgaven fra tasks-objektet og lagrer disse i variabler
        try {
          const taskPoints = tasks.get(idTask).points;
          const taskName = tasks.get(idTask).name;
          // Henter ut navnet på brukeren fra users-objektet ved hjelp av idUser og lagrer dette i en variabel
          const username = users.get(idUser);
          // Øker poengsummen for brukeren i familyPoints-objektet med poengene for oppgaven
          familyPoints.set(username, familyPoints.get(username) + taskPoints);
          // Legger til en ny array i log-objektet med informasjon om brukeren, dato, oppgavenavn og poengsum
          log.push([['name', username],['date', date],['task', taskName], ['points',taskPoints]]);
        }
        // Hvis det oppstår en feil, logges feilmeldingen i konsollen
        catch(err) {
          console.log(err.message);
        }
        
    });
    
  
    return { users, tasks, familyPoints, log };
  }
   // Fyll `usersSelect`-elementet med alternativer for alle familiemedlemmene
  // Tøm `usersSelect` først for å unngå duplikater
  function populateFamilyMembers(users) {
    usersSelect.innerHTML = "";
    users.forEach((name, id) => {
        // Lag en ny `option`-node for hvert familiemedlem
      const option = document.createElement("option");
      option.value = id; // Legg til familiemedlemmets id som `value
      option.textContent = name; // Legg til familiemedlemmets navn som tekstinnhold
      usersSelect.appendChild(option); // Legg til `option`-noden til `usersSelect`
    });
}

function populateTasks(tasks) {
   // Fyll `taskSelect`-elementet med alternativer for alle oppgavene
  // Tøm `taskSelect` først for å unngå duplikater
    taskSelect.innerHTML = "";
    tasks.forEach(({ name, points }, id) => {
      // Lag en ny `option`-node for hver oppgave
      const option = document.createElement("option");
      option.value = id; // Legg til oppgavens id som `value`
      option.textContent = `${name} (${points} pts)`; // Legg til oppgavens navn og poengsum som tekstinnhold
      taskSelect.appendChild(option); // Legg til `option`-noden til `taskSelect`
    });
}


// Lytt etter klikk på "Registrer"-knappen
regButton.addEventListener("click", async () => {
  // Hent valgt familiemedlems-id og konverter til et tall
  const selectedUserId = parseInt(usersSelect.value);
  // Hent valgt oppgaves-id og konverter til et tall
  const selectedTaskId = parseInt(taskSelect.value);
  // Hent navnet til det valgte familiemedlemmet
  const username = users.get(selectedUserId);
  // Hent oppgaven som ble valgt
  const selectedTask = tasks.get(selectedTaskId); 
  // Sjekk om oppgaven eksisterer
  if (!selectedTask) {
    console.error(`Task with id ${selectedTaskId} does not exist`);
    return;
  }
  // Hent poengene og navnet på oppgaven
  const taskPoints = selectedTask.points;
  const taskName = selectedTask.name;
  // Hent tiden nå og konverter til ISO-format
  const dateTime = new Date().toISOString();
  // Legg til poengene på familiemedlemmets totale poengsum
  familyPoints.set(username, familyPoints.get(username) + taskPoints);
  // Legg til informasjon om utført oppgave til loggen
  log.push([['name', username],['date', dateTime],['task', taskName], ['points',taskPoints]]);

  try {
    // Legg til informasjon om utført oppgave i databasen
    await db.collection("done").add({
      idUser: selectedUserId,
      idTask: selectedTaskId,
      date: dateTime    
    });

    console.log("Chore added successfully");
    // Generer ny rapport-tabell basert på oppdatert poengsum for familiemedlemmene
    const table = generateTable(familyPoints);
    divReport.innerHTML = "";
    divReport.appendChild(table);
  } catch (error) {
    console.error("Error adding chore:", error);
  }
});

// Funksjon som genererer en HTML-tabell basert på familiemedlemmenes poengsum
function generateTable(familyPoints) {
  // Opprett en ny tabell
  const table = document.createElement('table');
  // Definer HTML for overskriftsraden i tabellen
  let tableHtml = `<thead> <tr> \             
    <th>Family Member</th> \
    <th>Points</th> \
    </tr> \
    </thead> \
    <tbody>`;
  // Sorter familiemedlemmenes poengsum i synkende rekkefølge
  const sortedFamilyPoints = new Map([...familyPoints].sort((a, b) => b[1] - a[1]));
  // Legg til informasjon om hvert familiemedlem og deres poengsum i tabellen
  for (const [name, points] of sortedFamilyPoints) {
    tableHtml += '<tr>';
    tableHtml += `<td>${name}</td>`;
    tableHtml += `<td>${points}</td>`;
    tableHtml += '</tr>';
  }
  // Legg til HTML for tabellens innhold og returner tabellen
  table.innerHTML = tableHtml + '</tbody>';
  return table;
}
