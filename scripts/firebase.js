class Firebase {
  constructor(){
    this.firebaseConfig = {
      apiKey: "AIzaSyCRfhLBHpwzz0iWZbYHakvesAu7FK3x2_w",
      authDomain: "pwa-grupo1.firebaseapp.com",
      databaseURL: "https://pwa-grupo1-default-rtdb.firebaseio.com",
      projectId: "pwa-grupo1",
      storageBucket: "pwa-grupo1.appspot.com",
      messagingSenderId: "179629559064",
      appId: "1:179629559064:web:63ac484d65bc974737e26d"
    };

    this.database = null;
    this.firebaseRef = null;
    this.firebaseDatabase = null;
    this.DB = null;
    this.messaging = null;
    this.onMessage = null;
    this.token = null;
    
    // Initialize Firebase asynchronously
    this._initializeFirebase()
      .then(() => {
        this.setupConnectionListener();
        this.setupMessaging();
      });
  }

  setDB(DB){
    this.DB = DB
  }

  // Checks connection with firebase
  setupConnectionListener() {
    const connectedRef = this.firebaseDatabase.ref(this.database, ".info/connected");
    this.firebaseDatabase.onValue(connectedRef, (snapshot) => {
      const isConnected = snapshot.val();
      if (isConnected) {
        console.log("Firebase: Connected");
        // If firebase is back online, update
        this.DB.syncToFirebase()
      } else {
        console.log("Firebase: Disconnected");
      }
    });
  }


  setupMessaging() {
    this.onMessage((payload) => {
      console.log('Message from firebase:', payload);
    });
  }

  async _initializeFirebase() {
    try {
      // Load Firebase App asynchronously
      const firebase = await this._loadFirebaseApp();
      // Initialize Firebase App
      this.app = firebase.initializeApp(this.firebaseConfig);
      // Load Firebase Database asynchronously
      this.firebaseDatabase = await this._loadFirebaseDatabase();
      // Get a reference to the database service
      this.database = this.firebaseDatabase.getDatabase();
      // Reference to the location where you want to add the elements
      this.firebaseRef = this.firebaseDatabase.ref(this.database, 'notes');
      // Load Firebase Messaging asynchronously
      this.firebaseMessaging = await this._loadFirebaseMessaging();
      // Get a reference to the messaging service
      this.messaging = this.firebaseMessaging.getMessaging(this.app)
      // Get a reference to onMessage
      this.onMessage = this.firebaseMessaging.onMessage

    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  }

  //gxrOP1_nYuTxeNahxe4xvdNzKEhwMFHMsw4K2t1VaE4

  async _loadFirebaseApp() {
    try {
      return await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js");
    } catch (error) {
      console.error("Error loading Firebase App:", error);
      throw error;
    }
  }

  async _loadFirebaseDatabase() {
    try {
      return await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js");
    } catch (error) {
      console.error("Error loading Firebase Database:", error);
      throw error;
    }
  }

  async _loadFirebaseMessaging() {
    try {
      return await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging.js");
    } catch (error) {
      console.error("Error loading Firebase Messaging:", error);
      throw error;
    }
  }

  // Add the new data to the firebase database
  async addNote(note){
    try{
      this.firebaseRef = this.firebaseDatabase.ref(this.database, 'notes/'+note.id);
      await this.firebaseDatabase.set(this.firebaseRef, note);
      this.sendNotificacion([this.token],'hola','que tal')
      return true;
    } catch (error) {
      console.error("Error adding element to firebase: ", error);
      return false;
    }
  }

  // Delete data from firebase database
  async deleteNote(id){
    try {
      const noteRef = this.firebaseDatabase.ref(this.database, `notes/`+id);
      await this.firebaseDatabase.remove(noteRef);
      console.log(`Note with ID ${id} deleted from Firebase`);
      return true;
    } catch (error) {
      console.error(`Error deleting note with ID ${id} from Firebase:`, error);
      return false;
    }
  }

  // Gets all firebase notes
  async getAllNotes(){
    try {
      const snapshot = await this.firebaseDatabase.get(this.firebaseRef);
      const notes = [];
      snapshot.forEach(childSnapshot => {
        const note = childSnapshot.val();
        notes.push(note);
      });
      return notes;
    } catch (error) {
      console.error("Error getting notes from Firebase:", error);
      return [];
    }
  }

  async addToken(token){
    this.token = token
    try{
      this.firebaseRef = this.firebaseDatabase.ref(this.database, 'tokens/'+token);
      await this.firebaseDatabase.set(this.firebaseRef, token);
      return true;
    } catch (error) {
      console.error("Error adding token to firebase: ", error);
      return false;
    }
  }

  sendNotificacion(tokens, tittle, body) {
    // Datos del mensaje a enviar
    const message = {
      notification: {
        title: tittle,
        body: body
      },
      registration_ids: tokens
    };
  
    // URL del servidor de Firebase Cloud Messaging
    const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
  
    // Clave de servidor de Firebase (reemplázala con tu clave)
    const serverKey = 'BKSY5FG57DftNgn4bU3Xu4RTjv3t23HXJDGLXJ5Kc5Mg1PSnC4zfri2JGHppM_59SLIzlsbn8MDpXzAKO6z6dRk';
  
    // Encabezados de la solicitud HTTP
    const headers = {
      'Authorization': 'key=' + serverKey,
      'Content-Type': 'application/json'
    };
  
    // Realizar la solicitud HTTP POST a Firebase Cloud Messaging
    return fetch(fcmUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(message)
    })
    .then(response => {
      if (response.ok) {
        console.log('Notificación enviada exitosamente');
      } else {
        console.error('Error al enviar la notificación');
        console.log(response)
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error en la solicitud:', error);
      return Promise.reject(error);
    });
  }

}

export default Firebase;
