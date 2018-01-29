
function connectAgent()
{
    ip = "127.0.0.1"
    port = "8000"

    console.log("Connection to " + "wss://" + ip + ":" + port + "...");
    // Let us open a web socket
    var ws = new WebSocket("wss://" + ip + ":" + port);
    ws.onopen = function()
    {
        // Web Socket is connected, send data using send()
        ws.send("Message to send");
        console.log("ws.onopen: Message is sent...");

    };

    ws.onmessage = function (evt)
    {
        var received_msg = evt.data;
        console.log("ws.onmessage: " + received_msg)
    };

    ws.onclose = function()
    {
        // websocket is closed.
        alert("Connection is closed...");
        console.log("ws.onclose: ")
    };
}

var host = "163.5.84.202";

var api_endpoint = host + "/api";
var user_endpoint = api_endpoint + "/user";
var login_endpoint = user_endpoint + "/login";
var conf_endpoint = api_endpoint + "/configuration";
var soft_endpoint = api_endpoint + "/software";

var user = {
    'login': null,
    'password': null,
    'json': null
};

function xdr()
{
    var xdr = null;
    if (window.XDomainRequest)
        xdr = new XDomainRequest();
    else if (window.XMLHttpRequest)
        xdr = new XMLHttpRequest();
    else
        console.log("Module non compatible");
    return (xdr);
}

function connectServer(login, password)
{
    var xhr = new xdr();
    xhr.open("POST", "http://" + login_endpoint, false);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.addEventListener("load", function(e)
    {
        console.log(e.target.responseText);

        // Parse Request
        var json = JSON.parse(e.target.responseText);

        // Check callback
        if (!json || (json && (json.hasOwnProperty('error') || !json.hasOwnProperty('data'))))
        {
            var loginError = document.getElementById('login-error');
            loginError.innerHTML = "<strong>Error ! </strong>" + json.error;
            loginError.hidden = false;
            console.log('Error: Login failed.');
        }
        else
        {
            user.login = login;
            user.password = password;
            user.json = json;
            saveUser(json, login, password)
            console.log('Hello ' + user.json.data.login);
            window.location = 'onglets.html';
        }
    }, false);
    xhr.send(JSON.stringify(
        {
            "login" : login,
            "password" : password,
        }));
}

function downloadSoftware(id)
{
    if (user === null)
        return;

    var xhr = new xdr();
    xhr.open("GET", "http://" + soft_endpoint + "/" + id, false);
    xhr.setRequestHeader("Authorization", "Bearer " + user.json.data.api_token);
    xhr.addEventListener("load", function(e)
    {
        console.log(e.target.responseText);

        // Parse Request
        var json = JSON.parse(e.target.responseText);

        // Check callback
        if (!json || (json && (json.hasOwnProperty('error') || !json.hasOwnProperty('data'))))
            console.log('Error: Download failed.');
        else
        {
            console.log('URL: ' + json.data.download_url);

        }
    }, false);
    xhr.send(null);


}

function downloadConfiguration(id)
{
    if (user === null)
        return;

    var xhr = new xdr();
    xhr.open("GET", "http://" + conf_endpoint + "/" + id, false);
    xhr.setRequestHeader("Authorization", "Bearer " + user.json.data.api_token);
    xhr.addEventListener("load", function(e)
    {
        console.log(e.target.responseText);

        // Parse Request
        var json = JSON.parse(e.target.responseText);

        // Check callback
        if (json && json.hasOwnProperty('error'))
            console.log('Error: Download failed.');
        else
            console.log('Content: ' + e.target.responseText);
    }, false);
    xhr.send(null);
}

function getSoftwares()
{
    if (user === null)
        return;

    var xhr = new xdr();
    xhr.open("GET", "http://" + soft_endpoint, false);
    xhr.setRequestHeader("Authorization", "Bearer " + user.json.data.api_token);
    xhr.addEventListener("load", function(e)
    {
        console.log(e.target.responseText);

        // Parse Request
        var json = JSON.parse(e.target.responseText);

        // Check callback
        if (!json || (json && (json.hasOwnProperty('error') || !json.hasOwnProperty('data'))))
            console.log('Error: Failed to get softwares.');
        else
            console.log('Content: ' + e.target.responseText);
            var softwares = json.data;
            console.log(softwares[0]);

            var container=document.getElementById('softwaresTable');
            var i = 1;
            softwares.forEach(function(soft) {
                var row = document.createElement('tr');
                var id = document.createElement('th');
                id.innerHTML = i;
                row.appendChild(id);
                var softwareName = document.createElement('td');
                softwareName.innerHTML = soft.name;
                row.appendChild(softwareName);
                var version = document.createElement('td');
                version.innerHTML = soft.version;
                row.appendChild(version);
                var downloadLink = document.createElement('td');
                var href = document.createElement('a');
                href.href = soft.download_url;
                href.innerHTML = "Download";
                downloadLink.appendChild(href);
                row.appendChild(downloadLink);
                container.appendChild(row);
                i++;
            });
    }, false);
    xhr.send(null);
}

//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

if (!window.indexedDB)
{
    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
}

const userData = [
    {
        id: 1,
        json: null,
        login: null,
        password: null
    }
];


var db;
var request = window.indexedDB.open("user", 1);

request.onerror = function(event) {
    console.log("error: ");
};

request.onsuccess = function(event) {
    db = request.result;
    console.log("success: " + db);
    loadUser();
};

request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("user", {keyPath: "id"});
    for (var i in userData) {
        objectStore.add(userData[i]);
    }
}

function loadUser()
{
    var transaction = db.transaction(["user"]);
    var objectStore = transaction.objectStore("user");
    var request = objectStore.get(1);
    request.onsuccess = function (event)
    {
        if (request.result !== undefined)
        {
            user.login = request.result.login;
            user.password = request.result.password;
            user.json = request.result.json;
            if (window.location.href.indexOf('login.html') !== -1 && user.login !== null && user.password !== null)
                connectServer(user.login, user.password);
        }
    };
}

function saveUser(json, login, password)
{
    var req = db.transaction(["user"], "readwrite")
        .objectStore("user")
        .put({
            id: 1,
            json: json,
            login: login,
            password: password
        });
}

function deleteUser()
{
    var request = db.transaction(["user"], "readwrite")
        .objectStore("user")
        .delete(1);
    window.location = "login.html";
}
