import DB from "./db.js";
import View from "./view.js";

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
  const dbName = "mydb";
  const tableName = "notes";
  const model = new DB(dbName, tableName);
  const view = new View();

  view.setModel(model);
  model.setView(view);

  view.render();
});
