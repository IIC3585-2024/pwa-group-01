import DB from "./db.js";
import View from "./view.js";
import Firebase from "./firebase.js"
import "/scripts/firebase/firebase-app.js"
import "/scripts/firebase/firebase-database.js"
import "/scripts/firebase/firebase-messaging.js"

Notification.requestPermission()

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("serviceWorker.js")
      .then((res) => {
        console.log("Service Worker: Registered");
        const app = firebase.initializeApp({
          apiKey: "AIzaSyCRfhLBHpwzz0iWZbYHakvesAu7FK3x2_w",
          authDomain: "pwa-grupo1.firebaseapp.com",
          databaseURL: "https://pwa-grupo1-default-rtdb.firebaseio.com",
          projectId: "pwa-grupo1",
          storageBucket: "pwa-grupo1.appspot.com",
          messagingSenderId: "179629559064",
          appId: "1:179629559064:web:63ac484d65bc974737e26d"
        });

        const messaging = firebase.messaging(app);
        messaging.getToken({ vapidKey: 'BKSY5FG57DftNgn4bU3Xu4RTjv3t23HXJDGLXJ5Kc5Mg1PSnC4zfri2JGHppM_59SLIzlsbn8MDpXzAKO6z6dRk' }).then((currentToken) => {
          if (currentToken) {
            console.log(currentToken)
          } else {
            console.log('No registration token available. Request permission to generate one.');
            // ...
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
          // ...
        });
        messaging.onMessage(messaging, (payload) => {
          console.log('Message received. ', payload);
          // Update the UI to include the received message.
          appendMessage(payload);
        });

      })
      .catch((err) => {
        console.error("Service Worker: Error registering", err);
      });
  });
}

addEventListener("DOMContentLoaded", () => {
//drSm5R9F8tLva8mQ_hbWc4:APA91bEtPFNJRFWT1cIpXy0kbvS8qLcF2bYMeOR1VGYE2bRflruqQwEI4PDtZlzIfefOPfhrxzQQ78g8dQj6BvjGEo0VNivu6b9MX1U2DnczMIoDz1YF7JEp0DXo7T7xGs5nCFUr5qwh
  const dbName = "mydb";
  const tableName = "notes";
  const firebase = new Firebase();
  const model = new DB(dbName, tableName, firebase);
  const view = new View();

  view.setModel(model);
  model.setView(view);

  view.render();
});