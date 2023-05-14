const firebaseConfig = {
    apiKey: "AIzaSyB23hKMvxSfDpvpbHj9HQK-K6zBb2zDhGc",
    authDomain: "todo1-7afd2.firebaseapp.com",
    projectId: "todo1-7afd2",
    storageBucket: "todo1-7afd2.appspot.com",
    messagingSenderId: "271205919645",
    appId: "1:271205919645:web:6eb6ce29cc58ad02569d74"
  };
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const form = document.querySelector('form');
const nameInput = document.querySelector('#name');
const descriptionInput = document.querySelector('#description');
const pointsInput = document.querySelector('#points');
const submitButton = document.querySelector('#submit');

submitButton.addEventListener('click', (event) => {
  event.preventDefault();

  const name = nameInput.value;
  const description = descriptionInput.value;
  const points = parseInt(pointsInput.value);
  const id = 4; // Set the ID of the new task to 4

  db.collection('Task').doc(id.toString()).set({
    name: name,
    description: description,
    points: points
  })
  .then(() => {
    console.log("Task added with ID: ", id);
    alert("Task added successfully!");
    form.reset();
  })
  .catch((error) => {
    console.error("Error adding task: ", error);
    alert("Error adding task. Please try again later.");
  });
});