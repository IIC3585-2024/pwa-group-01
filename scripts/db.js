class DB {
  constructor(dbName, tableName) {
    this.db;
    this.currentId = 1;
    this._init_db(dbName, tableName);
  }

  _init_db(dbName, tableName) {
    this._dbRequest = indexedDB.open(dbName, 1);
    this._dbRequest.addEventListener("error", (err) => {
      console.error("Error opening database:", err);
    });

    this._dbRequest.addEventListener("success", (event) => {
      this.db = event.target.result;
      console.log("Database opened");
    });

    this._dbRequest.addEventListener("upgradeneeded", (event) => {
      this.db = event.target.result;
      this.db.onerror = (err) => {
        console.error("Error creating database:", err);
      };
      this.db.createObjectStore(tableName, {
        keyPath: "id",
        autoIncrement: true,
      });

      if (!this.db.objectStoreNames.contains("currentIdStore")) {
        this.db.createObjectStore("currentIdStore", { keyPath: "id" });
      }

      console.log("Database created");
    });
  }

  addNote(note) {
    const transaction = this.db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.add(note);

    request.onsuccess = function (event) {
      console.log("Note added to database");
    };

    request.onerror = function (event) {
      console.error("Error adding note to database:", event.target.error);
    };
  }

  getAllNotes(callback) {
    const transaction = this.db.transaction([tableName], "readonly");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
      const notes = event.target.result;
      callback(notes); // Llamar a la devolución de llamada con los datos recuperados
    };

    request.onerror = function (event) {
      console.error("Error getting notes from database:", event.target.error);
    };
  }

  deleteAllNotes(callback) {
    const transaction = this.db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.clear();

    request.onsuccess = function (event) {
      console.log("All notes deleted from database");
      if (callback) {
        callback();
      }
    };

    request.onerror = function (event) {
      console.error("Error deleting notes from database:", event.target.error);
    };
  }

  deleteNoteById(id, callback) {
    const transaction = this.db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.delete(id);

    request.onsuccess = (event) => {
      console.log(`Note with ID ${id} deleted successfully`);
      if (callback) {
        callback();
      }
    };

    request.onerror = (event) => {
      console.error(
        `Error deleting note with ID ${id} from database:`,
        event.target.error
      );
    };
  }
}

const dbName = "mydb";
const tableName = "notes";

const db = new DB(dbName, tableName);

export default db;
