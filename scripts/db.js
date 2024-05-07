class DB {
  constructor(dbName, tableName) {
    this.db;
    this.tableName = tableName;
    this._dbPromise = this._init_db(dbName);
    this.view = null;

    if (!localStorage.getItem("currentId")) {
      localStorage.setItem("currentId", 1);
    }
  }

  _init_db(dbName) {
    return new Promise((resolve, reject) => {
      this._dbRequest = indexedDB.open(dbName, 1);
      this._dbRequest.addEventListener("error", (err) => {
        console.error("Error opening database:", err);
        reject(err);
      });

      this._dbRequest.addEventListener("success", (event) => {
        this.db = event.target.result;
        console.log("Database opened");
        resolve();
      });

      this._dbRequest.addEventListener("upgradeneeded", (event) => {
        this.db = event.target.result;
        this.db.onerror = (err) => {
          console.error("Error creating database:", err);
        };
        this.db.createObjectStore(this.tableName, {
          keyPath: "id",
          autoIncrement: true,
        });

        console.log("Database created");
      });
    });
  }

  setView(view) {
    this.view = view;
  }

  incrementCurrentId() {
    const prev = parseInt(localStorage.getItem("currentId"));
    localStorage.setItem("currentId", prev + 1);
  }

  addNote(note, drawInTable) {
    console.log("Nota a guardar: ", note);
    const transaction = this.db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.add(note);

    request.onsuccess = (event) => {
      this.incrementCurrentId();
      drawInTable(note);
      console.log("Note added to database");
    };

    request.onerror = (event) => {
      console.error("Error adding note to database:", event.target.error);
    };
  }

  getAllNotes(callback) {
    this._dbPromise.then(() => {
      // Esperar a que la base de datos se abra
      const transaction = this.db.transaction([this.tableName], "readonly");
      const objectStore = transaction.objectStore(this.tableName);
      const request = objectStore.getAll();

      request.onsuccess = function (event) {
        const notes = event.target.result;
        callback(notes); // Llamar a la devolución de llamada con los datos recuperados
      };

      request.onerror = function (event) {
        console.error("Error getting notes from database:", event.target.error);
      };
    });
  }

  deleteAllNotes(callback) {
    const transaction = this.db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.clear();

    request.onsuccess = function (event) {
      console.log("All notes deleted from database");
      localStorage.setItem("currentId", 1);
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

  toggleNote(id) {
    console.log("Entra a toggle");
    const transaction = this.db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    const getRequest = objectStore.get(id); // Obtener la nota por su ID

    getRequest.onsuccess = (event) => {
      const note = event.target.result;
      if (note) {
        // Si se encuentra la nota, cambiar su estado 'completed'
        note.completed = !note.completed;
        const updateRequest = objectStore.put(note); // Actualizar la nota en la base de datos

        updateRequest.onsuccess = (event) => {
          console.log(
            `Note with ID ${id} toggled successfully ${note.completed}`
          );
        };

        updateRequest.onerror = (event) => {
          console.error(
            `Error toggling note with ID ${id}:`,
            event.target.error
          );
        };
      } else {
        console.error(`Note with ID ${id} not found`);
      }
    };

    getRequest.onerror = (event) => {
      console.error(`Error getting note with ID ${id}:`, event.target.error);
    };
  }
}

const dbName = "mydb";
const tableName = "notes";

export default DB;
