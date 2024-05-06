import db from "./db.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("serviceWorker.js")
      .then((res) => {
        console.log("Service Worker: Registered");
      })
      .catch((err) => {
        console.error("Service Worker: Error registering", err);
      });
  });
}

addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("add");
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const table = document.getElementById("table");
  const deleteAllButton = document.getElementById("delete-all-button");

  let id = 1;

  const removeNote = (id) => {
    document.getElementById(id).remove();
    db.deleteNoteById(id);
  };

  const addNote = () => {
    if (title.value === "" || description.value === "") {
      console.error("title and description are required");
      return;
    }

    const row = table.insertRow();
    row.setAttribute("id", id++);
    row.innerHTML = `
      <td>${title.value}</td>
      <td>${description.value}</td>
      <td class="check-container">
        <input type="checkbox" />
      </td>
      <td>
        <button class="edit-button">
          <span class="material-symbols-outlined"> edit </span>
        </button>
      </td>
    `;

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("delete-button");
    removeBtn.innerHTML = `<span class="material-symbols-outlined"> delete </span>`;
    row.children[3].appendChild(removeBtn);
    removeBtn.onclick = (e) => {
      removeNote(row.getAttribute("id"));
    };

    const note = {
      id: row.getAttribute("id"),
      title: title.value,
      description: description.value,
    };

    db.addNote(note); // Llamada al método addNote de la clase DB para agregar la nota a la base de datos
  };

  btn.onclick = addNote;

  // Función para cargar los elementos desde la base de datos
  const cargar = () => {
    console.log("entra a cargar");
    db.getAllNotes((notes) => {
      notes.forEach((note) => {
        const row = table.insertRow();
        row.setAttribute("id", note.id);
        row.innerHTML = `
          <td>${note.title}</td>
          <td>${note.description}</td>
          <td class="check-container">
            <input type="checkbox" />
          </td>
          <td>
            <button class="edit-button">
              <span class="material-symbols-outlined"> edit </span>
            </button>
          </td>
        `;
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("delete-button");
        removeBtn.innerHTML = `<span class="material-symbols-outlined"> delete </span>`;
        row.children[3].appendChild(removeBtn);
        removeBtn.onclick = (e) => {
          removeNote(row.getAttribute("id"));
        };
      });
    });
  };

  // Agregar un event listener al botón
  deleteAllButton.addEventListener("click", () => {
    db.getAllNotes((notes) => {
      notes.forEach((note) => {
        document.getElementById(note.id).remove();
      });
    });
    db.deleteAllNotes(() => {
      console.log("All notes deleted successfully");
    });
  });

  // Abrir la base de datos y luego cargar los elementos
  db._dbRequest.addEventListener("success", (event) => {
    db.db = event.target.result;
    console.log("Database opened");
    cargar(); // Llamada a la función cargar después de abrir con éxito la base de datos
  });
});
