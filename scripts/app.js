import DB from "./db.js";
import View from "./view.js";
import Firebase from "./firebase.js"
import "./firebase/firebase-app.js"
import "./firebase/firebase-database.js"
import "./firebase/firebase-messaging.js"

let firebaseModel = null

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("firebase-messaging-sw.js")
      .then((res) => {
        console.log("Service Worker: Registered");

      })
      .catch((err) => {
        console.error("Service Worker: Error registering", err);
      });
  });
}

addEventListener("DOMContentLoaded", () => {
  const dbName = "mydb";
  const tableName = "notes";
  firebaseModel = new Firebase();
  const model = new DB(dbName, tableName, firebaseModel);
  const view = new View();

  view.setModel(model);
  model.setView(view);

  view.render();
});

async function setupFirebase(){
  let app = firebase.initializeApp({
    apiKey: "AIzaSyCRfhLBHpwzz0iWZbYHakvesAu7FK3x2_w",
    authDomain: "pwa-grupo1.firebaseapp.com",
    databaseURL: "https://pwa-grupo1-default-rtdb.firebaseio.com",
    projectId: "pwa-grupo1",
    storageBucket: "pwa-grupo1.appspot.com",
    messagingSenderId: "179629559064",
    appId: "1:179629559064:web:63ac484d65bc974737e26d"
  });
  const messaging = firebase.messaging(app);
  const registration = await navigator.serviceWorker.getRegistration();
  messaging.useServiceWorker(registration);
  messaging.getToken({ vapidKey: 'BKSY5FG57DftNgn4bU3Xu4RTjv3t23HXJDGLXJ5Kc5Mg1PSnC4zfri2JGHppM_59SLIzlsbn8MDpXzAKO6z6dRk' }).then((currentToken) => {
    if (currentToken) {
      console.log(currentToken)
      firebaseModel.addToken(currentToken)
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
  });
}

function setup() {
  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setupFirebase()
      }
    });
  }else{
    setupFirebase()
  }
}

setTimeout(setup, 10000);

navigator.serviceWorker.onmessage = (event) => {
  console.log(event.data)
  try{
    if(event.data.messageType === 'push-received'){
      let notificationData = {title: event.data.notification.title, body: event.data.notification.body}
      console.log(notificationData)
      console.log(Notification.permission)
      notifyMe(notificationData)
    }
  }
  catch (err){
    console.error('Service Worker message reception failed: ', err)
  }
};

function notifyMe(message) {
  if (!("Notification" in window)) {
    // Check if the browser supports notifications
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    const notification = new Notification("Hi there!");
    // …
  } else if (Notification.permission !== "denied") {
    // We need to ask the user for permission
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        const notification = new Notification("Hi there!");
        // …
      }
    });
  }
}