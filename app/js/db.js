/*
 * Local DB part
 */

//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB)
{
    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

const userData = [
    {
        id: 1,
        user: null
    }
];

var db;
var request = window.indexedDB.open('user', 1);

request.onerror = function(event) {
    console.log('error: ');
};

request.onsuccess = function(event) {
    db = request.result;
    console.log('success: ' + db);
    loadUser();
};

request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore('user', {keyPath: 'id'});
    for (var i in userData) {
        objectStore.add(userData[i]);
    }
};