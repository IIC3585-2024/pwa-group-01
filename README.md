# PWA
This repository contains a PWA replicating some of the functionalities of https://anonynote.org/.

## Usage
### Online
The application is deployed on the following [link](https://iic3585-2024.github.io/pwa-group-01/#)

### Local
- Download the repo
- Run a simple server on the root of the repo (e.g., using Python's built-in HTTP server with `python -m http.server`)
- If the server uses HTTP, browsers will block some of the functionalities. You'll need to manually mark the URL as secure:

    **Chrome:**

    To mark an HTTP URL as secure in Chrome, go to [chrome://flags/#unsafely-treat-insecure-origin-as-secure](chrome://flags/#unsafely-treat-insecure-origin-as-secure) and type `http://localhost:8000` or the used URL in "Insecure origins treated as secure" and enable it.

### Functionalities
#### Create, Update, and Delete
The app is able to create, delete, and update a note.

#### Offline
The app is able to cache the required files, ensuring minimum functionalities are available offline.

#### Installability
The app complies with the requirements for Chrome browser to allow it to be installed on mobile phones.

#### Push Notifications
The app allows push notifications to be displayed on devices. *Disclaimer*: the push notification needs to be manually triggered from Firebase.