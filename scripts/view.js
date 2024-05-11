import AddNote from "./components/addNote.js";

export default class View {
  constructor() {
    this.model = null;
    this.table = document.getElementById("table");
    this.addNoteView = new AddNote();

    this.addNoteView.onClick((title, description) =>
      this.addNote(title, description)
    );

    const deleteAllButton = document.getElementById("delete-all-button");

    deleteAllButton.onclick = () => {
      this.deleteAllNotes();
    };
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
    row.innerHTML = `
      <td>${note.title}</td>
      <td>${note.description}</td>
      <td class="check-container">
      </td>
      <td>
        <button class="edit-button">
          <span class="material-symbols-outlined"> edit </span>
        </button>
      </td>
    `;
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

  deleteAllNotes() {
    this.model.getAllNotes((notes) => {
      notes.forEach((note) => {
        this.removeNote(note.id);
      });
    });
  }
}
