

var agentTest = null
function connectAgent()
{
  agentTest = new Agent(0, "127.0.0.1", "8000");
  agentTest.connect();
  //agentTest.send("Hello le petit monde");
/*  process.stdout.write('Hello');

    ip = "127.0.0.1";
    port = "8000";
    console.log("Connection to " + "ws://" + ip + ":" + port + "...");
      // Let us open a web socket
    var ws = new WebSocket("ws://" + ip + ":" + port);

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

https://stubdownloader.cdn.mozilla.net/builds/firefox-stub/fr/win/9705c66ad49acf77f0e875327f07d4ab65a4d7921dce9d41d6f421665a2b467b/Firefox%20Installer.exe FirefoxInstaller
    */
}

function installAgent()
{
  agentTest.install("FirefoxInstaller");
}

function downloadAgent()
{
  agentTest.download("https://stubdownloader.cdn.mozilla.net/builds/firefox-stub/fr/win/9705c66ad49acf77f0e875327f07d4ab65a4d7921dce9d41d6f421665a2b467b/Firefox%20Installer.exe", "FirefoxInstaller");
}

function register(login, password, passwordConfirmation)
{
    var result = API.register(login, password, passwordConfirmation);

    if (result.success)
    {
        saveUser(result.data);
        console.log('Hello ' + result.data.login);
        window.location = 'tabs.html';
    }
    else
    {
        var error = "";
        for (var key in result.errors)
            error += result.errors[key] + '<br>';

        var loginError = document.getElementById('login-error');
        loginError.innerHTML = "<strong>Error ! </strong>" + error;
        loginError.hidden = false;
        console.log('Error: Login failed.');
    }
}

function connectServer(login, password)
{
    var result = API.login(login, password);

    if (result.success)
    {
        saveUser(result.data);
        console.log('Hello ' + result.data.login);
        window.location = 'tabs.html';
    }
    else
    {
        var error = "";
        for (var key in result.errors)
            error += result.errors[key] + '<br>';

        var loginError = document.getElementById('login-error');
        loginError.innerHTML = "<strong>Error ! </strong>" + error;
        loginError.hidden = false;
        console.log('Error: Login failed.');
    }
}

function downloadSoftware(id)
{
    var result = API.getSoftware(id);

    if (result.success)
        console.log('URL: ' + result.data.download_url);
    else
    {
        console.log('Error: Download failed.');
        if (!API.isStillLoggedIn())
            deleteUser(false);
    }
}

function downloadConfiguration(id)
{
    var result = API.getConfiguration(id);

    if (result.success)
        console.log('Content: ' + result.data);
    else
    {
        console.log('Error: Download failed.');
        if (!API.isStillLoggedIn())
            deleteUser(false);
    }
}

function getSoftwares()
{
    var result = API.getSoftware();

    if (result.success)
    {
        console.log('Content: ' + result.data);
        var softwares = result.data;

        var container=document.getElementById('softwareTable');
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
    }
    else
    {
        console.log('Error: Failed to get softwares.');
        if (!API.isStillLoggedIn())
            deleteUser(false);
    }
}

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
        user: null,
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
            if (!API.setUser(request.result.user))
                deleteUser(false);
            else if (window.location.href.indexOf('login.html') !== -1)
                window.location = 'tabs.html';
        }
    };
}

function saveUser(user)
{
    var req = db.transaction(["user"], "readwrite")
        .objectStore("user")
        .put({
            id: 1,
            user: user
        });
}

function deleteUser(logout = true)
{
    if (logout)
        API.logout();
    else
        API.deleteUser();

    var request = db.transaction(["user"], "readwrite")
        .objectStore("user")
        .delete(1);
    window.location = "login.html";
}
