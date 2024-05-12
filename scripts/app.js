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
      messaging.onMessage((payload) => {
        console.log('Notificación push recibida en primer plano:', payload);
      });
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