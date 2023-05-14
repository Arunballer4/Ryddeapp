const firebaseConfig = {
    apiKey: "AIzaSyB23hKMvxSfDpvpbHj9HQK-K6zBb2zDhGc",
    authDomain: "todo1-7afd2.firebaseapp.com",
    projectId: "todo1-7afd2",
    storageBucket: "todo1-7afd2.appspot.com",
    messagingSenderId: "271205919645",
    appId: "1:271205919645:web:6eb6ce29cc58ad02569d74"
  };
  
  // Initialize the Firebase app with the configuration
  firebase.initializeApp(firebaseConfig);
  
  // Get the Firestore collections for completed tasks, users, and tasks
  let doneCollection = firebase.firestore().collection('done');
  let usersCollection = firebase.firestore().collection('users');
  let tasksCollection = firebase.firestore().collection('tasks');
  
  // Get the table for the task history from the HTML document
  let taskHistoryTable = document.getElementById("task-history");
  
  // Get the data from all three collections simultaneously using Promise.all() and sort completed tasks by date
  Promise.all([
    doneCollection.orderBy('date', 'desc').get(),
    usersCollection.get(),
    tasksCollection.get()
  ]).then((querySnapshots) => {
    // Create two empty maps to store user and task information
    let usersMap = new Map();
    let tasksMap = new Map();
  
    // Populate the user map with data from "usersCollection"
    querySnapshots[1].forEach((doc) => {
      let userData = doc.data();
      usersMap.set(userData.id, userData.name);
    });
  
    // Populate the task map with data from "tasksCollection"
    querySnapshots[2].forEach((doc) => {
      let taskData = doc.data();
      tasksMap.set(taskData.id, taskData.name);
    });
  
    // Add the rows to the task history table with data from "doneCollection"
    querySnapshots[0].forEach((doc) => {
      let taskData = doc.data();
      let date = new Date(taskData.date);
      let taskId = taskData.idTask;
      let userId = taskData.idUser;
      let row = taskHistoryTable.insertRow(-1);
      let dateCell = row.insertCell(0);
      let taskCell = row.insertCell(1);
      let userCell = row.insertCell(2);
      let pointsCell = row.insertCell(3);
      dateCell.innerHTML = date.toLocaleDateString();
      taskCell.innerHTML = taskId;
      userCell.innerHTML = usersMap.get(userId);
      pointsCell.innerHTML = "1"; // or whatever value you want to display
    });
  }).catch((error) => {
    console.log("Error getting task history data: ", error);
  });
  