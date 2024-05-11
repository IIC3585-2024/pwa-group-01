export default class AddNote {
  constructor() {
    this.btn = document.getElementById("add");
    this.title = document.getElementById("title");
    this.description = document.getElementById("description");
  }

  onClick(callback) {
    this.btn.onclick = () => {
      if (title.value === "" || description.value === "") {
        console.error("title and description are required");
        return;
      } else {
        callback(this.title, this.description);
      }
    };
  }
}
