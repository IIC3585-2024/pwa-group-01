//import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
//import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

class DB {
  constructor(dbName, tableName, firebase) {
    this.db;
    this.tableName = tableName;
    this.updateTableName = 'update'+ tableName
    this._dbPromise = this._init_db(dbName);
    this.view = null;
    this.firebase = firebase
    this.firebase.setDB(this)

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
        this.db.createObjectStore(this.updateTableName, {
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

  addNote(note, drawInTable, fromFirebase = false) {
    if(!fromFirebase){
      this.toUpdate({ id: note.id, note: note, action: '1_created' });
      // Trys to save the note on the cloud
      this.firebase.addNote(note)
        .then((added) => {
          // If created delete action from update db
          if(added){
            this.deleteUpdateById(note.id)
          }
        });
    }

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

  deleteNoteById(id, callback, fromFirebase = false) {
    if(!fromFirebase){
      this.toUpdate({ id: id, action: '3_deleted', noteId: id });
      // Delete the note on firebase
      this.firebase.deleteNote(id)
        .then((added) => {
          // If created delete action from update db
          if(added){
            this.deleteUpdateById(id)
          }
        });
    }

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

  changeNoteColor(id, color) {
    const transaction = this.db.transaction([this.tableName], "readwrite");
    const objectStore = transaction.objectStore(this.tableName);
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = (event) => {
      const note = event.target.result;
      if (note) {
        note.color = color; // Cambia el color de la nota
        const updateRequest = objectStore.put(note); // Actualiza la nota en la base de datos

        updateRequest.onsuccess = (event) => {
          console.log(
            `Color of note with ID ${id} changed successfully to ${color}`
          );
        };

        updateRequest.onerror = (event) => {
          console.error(
            `Error changing color of note with ID ${id}:`,
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

  getNoteColorById(id, callback) {
    const transaction = this.db.transaction([this.tableName], "readonly");
    const objectStore = transaction.objectStore(this.tableName);
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = (event) => {
      const note = event.target.result;
      if (note) {
        const color = note.color;
        callback(color); // Llama al callback con el color de la nota
      } else {
        console.error(`Note with ID ${id} not found`);
        callback(null); // Si no se encuentra la nota, llama al callback con null
      }
    };

    getRequest.onerror = (event) => {
      console.error(`Error getting note with ID ${id}:`, event.target.error);
      callback(null); // Si hay un error, llama al callback con null
    };
  }

  updateNote(id, updatedFields) {
    const transaction = this.db.transaction([this.tableName], "readwrite");
    const objectStore = transaction.objectStore(this.tableName);
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = (event) => {
      const note = event.target.result;
      if (note) {
        // Actualizar los campos de la nota con los nuevos valores
        for (const field in updatedFields) {
          if (field !== "id") {
            // Asegúrate de no cambiar el ID
            note[field] = updatedFields[field];
          }
        }

        const updateRequest = objectStore.put(note); // Actualizar la nota en la base de datos

        updateRequest.onsuccess = (event) => {
          console.log(`Note with ID ${id} updated successfully`);
        };

        updateRequest.onerror = (event) => {
          console.error(
            `Error updating note with ID ${id}:`,
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

  getNoteById(id, callback) {
    const transaction = this.db.transaction([this.tableName], "readonly");
    const objectStore = transaction.objectStore(this.tableName);
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = (event) => {
      const note = event.target.result;
      if (note) {
        callback(note); // Llama al callback con la nota encontrada
      } else {
        console.error(`Note with ID ${id} not found`);
        callback(null); // Si no se encuentra la nota, llama al callback con null
      }
    };

    getRequest.onerror = (event) => {
      console.error(`Error getting note with ID ${id}:`, event.target.error);
      callback(null); // Si hay un error, llama al callback con null
    };
  }

  // Function to store update data, it should delete itself when commited to firebase
  toUpdate(note){
    note.id = note.id+note.action
    const transaction = this.db.transaction([this.updateTableName], "readwrite");
    const objectStore = transaction.objectStore(this.updateTableName);
    const request = objectStore.add(note);
    request.onsuccess = (event) => {
      console.log("Note added to update database");
    };

    request.onerror = (event) => {
      console.error("Error adding note to update database:", event.target.error);
    };
  }
  
  // Checks if 2 notes are the same
  equalNotes(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (let key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
  
    return true;
  }

  // SyncDBToFirebase
  async syncToFirebase(){
    await this.uploadToFirebase()
    await this.downloadFromFirebase()
  }

  // Upload updates created while offline to Firebase
  async uploadToFirebase(){
    await new Promise((resolve, reject) => {
      this._dbPromise.then(() => {
        const transaction = this.db.transaction([this.updateTableName], "readonly");
        const objectStore = transaction.objectStore(this.updateTableName);
        const request = objectStore.getAll();
  
        request.onsuccess = (event) => {
          const updates = event.target.result;
          updates.forEach((update) => {

            switch (update.action) {
              case '1_created':
                this.firebase.addNote(update.note)
                  .then((added) => {
                    if(added){
                      this.deleteUpdateById(update.id)
                    }
                  });
                break;
              case '3_deleted':
                this.firebase.deleteNote(update.noteId)
                  .then((added) => {
                    if(added){
                      this.deleteUpdateById(update.id)
                    }
                  });
            }
          });
          resolve();
        };
  
        request.onerror = function (event) {
          console.error("Error getting notes from update database:", event.target.error);
          reject(event.target.error);
        };
      });
    });
  }

  // Download updates occured while offline from Firebase
  async downloadFromFirebase(){
    // Get all firebase notes
    let firebaseNotes = await this.firebase.getAllNotes()
    // Get al local db notes
    this._dbPromise.then(() => {
      const transaction = this.db.transaction([this.tableName], "readonly");
      const objectStore = transaction.objectStore(this.tableName);
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        // local db notes
        const notes = event.target.result;
        let ids = []
        notes.forEach((note) => {ids.push(note.id)})
        let fbIds = []
        // Check every note on firebase to see if there are new ones
        firebaseNotes.forEach((note) => {
          fbIds.push(note.id)
          // if the note already exists
          if(ids.includes(note.id)) {
            let localNote = notes.find( n => n.id === note.id)
            if(!this.equalNotes(localNote,note)){
              console.log('update note', note.id)
            }
          }else{
            this.addNote(note, (note) => {
              this.view.createTableRow(note);
            }, true)
          }
        })
        // Check every note on local to see if any was deleted online
        ids.forEach((id) => {
          if(!fbIds.includes(id)){
            this.deleteNoteById(id, null, true)
            document.getElementById(id).remove();
          }
        })
      };

      request.onerror = function (event) {
        console.error("Error getting notes from database:", event.target.error);
      };
    });
  }
}

export default DB;
