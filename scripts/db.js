class DB {
    constructor(dbName, tableName) {
        this.db;
        this._init_db(dbName, tableName);
    };

    _init_db(dbName, tableName) {
        this._dbRequest = indexedDB.open(dbName, 1);
        this._dbRequest.addEventListener('error', (err) => {
            console.error('Error opening database:', err);
        });

        this._dbRequest.addEventListener('success', (event) => {
            this.db = event.target.result;
            console.log('Database opened');
        });

        this._dbRequest.addEventListener('upgradeneeded', (event) => {
            this.db = event.target.result;
            this.db.onerror = (err) => {
                console.error('Error creating database:', err);
            };
            this.db.createObjectStore(tableName, { keyPath: 'id', autoIncrement: true });
            console.log('Database created');
        });
    };

    // Add more methods here
}

const dbName = 'mydb';
const tableName = 'notes';

const db = new DB(dbName, tableName);

export default db;
