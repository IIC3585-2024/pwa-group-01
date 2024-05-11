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

}

export default Firebase;
