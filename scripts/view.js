import AddNote from "./components/addNote.js";
import Modal from "./components/modal.js";
import Filters from "./components/filters.js";

export default class View {
  constructor() {
    this.model = null;
    this.table = document.getElementById("table");
    this.addNoteView = new AddNote();
    this.modal = new Modal();
    this.filters = new Filters();

    const deleteAllButton = document.getElementById("delete-all-button");

    deleteAllButton.onclick = () => {
      this.deleteAllNotes();
    };

    this.addNoteView.onClick((title, description) =>
      this.addNote(title, description)
    );

    this.modal.onClick((id, values) => {
      this.editNote(id, values);
    });

    this.filters.onClick((filters) => {
      this.filter(filters);
    });
  }

  setModel(model) {
    this.model = model;
  }

  getCurrentId() {
    return parseInt(localStorage.getItem("currentId"));
  }

  render() {
    this.model.getAllNotes((notes) => {
      notes.forEach((note) => {
        this.createTableRow(note);
      });
    });
  }

  addNote(title, description) {
    const note = {
      id: this.getCurrentId(),
      title: title.value,
      description: description.value,
      completed: false,
      color: "none",
    };

    this.model.addNote(note, (note) => {
      this.createTableRow(note);
    });
  }

  removeNote(id) {
    console.log("Entra a remove");
    this.model.deleteNoteById(id);
    document.getElementById(id).remove();
  }

  changeCompleted(id) {
    this.model.toggleNote(id);
  }

  createTableRow(note) {
    const row = table.insertRow();
    row.setAttribute("id", note.id);
    row.classList.add(note.color);
    row.innerHTML = `
      <td>${note.title}</td>
      <td class="description">${note.description}</td>
      <td class="check-container">
      </td>
      <td>
      </td>
    `;

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-button");
    editBtn.setAttribute("data-bs-toggle", "modal");
    editBtn.setAttribute("data-bs-target", "#exampleModal");
    editBtn.innerHTML = `<span class="material-symbols-outlined"> edit </span>`;
    row.children[3].appendChild(editBtn);
    editBtn.onclick = () =>
      this.model.getNoteById(note.id, (noteFinded) => {
        this.modal.setValues(noteFinded);
      });

    const colotBtn = document.createElement("button");
    colotBtn.innerHTML = `<span class="material-symbols-outlined"> format_color_fill </span>`;
    colotBtn.classList.add("edit-button");
    row.children[3].appendChild(colotBtn);

    colotBtn.onclick = () => {
      this.changeColor(row, note.id, note.color);
    };

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = note.completed;
    row.children[2].appendChild(checkbox);
    checkbox.onclick = () => this.changeCompleted(note.id);

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("delete-button");
    removeBtn.innerHTML = `<span class="material-symbols-outlined"> delete </span>`;
    row.children[3].appendChild(removeBtn);
    removeBtn.onclick = (e) => {
      this.removeNote(note.id);
    };
  }

  changeColor(row, id) {
    this.model.getNoteColorById(id, (currentColor) => {
      if (currentColor === "none") {
        row.classList.remove(currentColor);
        this.model.changeNoteColor(id, "blue");
        row.classList.add("blue");
      } else if (currentColor === "blue") {
        row.classList.remove(currentColor);
        this.model.changeNoteColor(id, "yellow");
        row.classList.add("yellow");
      } else if (currentColor === "yellow") {
        row.classList.remove(currentColor);
        this.model.changeNoteColor(id, "green");
        row.classList.add("green");
      } else if (currentColor === "green") {
        row.classList.remove(currentColor);
        this.model.changeNoteColor(id, "violet");
        row.classList.add("violet");
      } else if (currentColor === "violet") {
        row.classList.remove(currentColor);
        this.model.changeNoteColor(id, "orange");
        row.classList.add("orange");
      } else if (currentColor === "orange") {
        row.classList.remove(currentColor);
        this.model.changeNoteColor(id, "none");
        row.classList.add("none");
      }
    });
  }

  editNote(id, values) {
    this.model.updateNote(id, values);
    const row = document.getElementById(id);
    row.children[0].innerText = values.title;
    row.children[1].innerText = values.description;
    row.children[2].children[0].checked = values.completed;
  }

  filter(filters) {
    const { type, words } = filters;
    const [, ...rows] = this.table.getElementsByTagName("tr");
    for (const row of rows) {
      const [title, description, completed] = row.children;
      let hide = false;

      if (words) {
        hide =
          !title.innerText.includes(words) &&
          !description.innerText.includes(words);
      }

      const status = type === "completed";
      const rowStatus = completed.children[0].checked;

      if (type !== "all" && status !== rowStatus) {
        hide = true;
      }

      if (hide) {
        row.classList.add("d-none");
      } else {
        row.classList.remove("d-none");
      }
    }
  }

  deleteAllNotes() {
    this.model.getAllNotes((notes) => {
      notes.forEach((note) => {
        this.removeNote(note.id);
      });
    });
  }
}
