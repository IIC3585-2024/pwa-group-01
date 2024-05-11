export default class Modal {
  constructor() {
    this.title = document.getElementById("modal-title");
    this.description = document.getElementById("modal-description");
    this.btn = document.getElementById("modal-btn");
    this.completed = document.getElementById("modal-completed");
    this.note = null;
  }

  setValues(note) {
    console.log("Set Values");
    this.note = note;
    this.title.value = note.title;
    this.description.value = note.description;
    this.completed.checked = note.completed;
  }

  onClick(callback) {
    this.btn.onclick = () => {
      if (this.title.value === "" || this.description.value === "") {
        console.error("title and description are required");
        return;
      } else {
        callback(this.note.id, {
          title: this.title.value,
          description: this.description.value,
          completed: this.completed.checked,
          color: this.note.color,
        });
      }
    };
  }
}
