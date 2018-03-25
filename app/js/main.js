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
};



/*
 * Menu part
 */

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function SwitchTab(name)
{
    document.getElementById(numTab + 'Tab').className = 'Tab0 tab';
    document.getElementById(name + 'Tab').className = 'Tab1 tab';
    document.getElementById('Content' + numTab + 'Tab').style.display = 'none';
    document.getElementById('Content' + name + 'Tab').style.display = 'block';
    numTab = name;
    if (name === "Software")
    {
        document.getElementById('softwareTable').innerHTML = '';
        getSoftwares();
    }
}



/*
 * Agent part
 */

var agentTest = null;
function connectAgent()
{
  agentTest = new Agent(0, "127.0.0.1", "8000");
  agentTest.connect();
}

function installAgent()
{
  agentTest.install("FirefoxInstaller");
}

function downloadAgent()
{
  agentTest.download("https://stubdownloader.cdn.mozilla.net/builds/firefox-stub/fr/win/9705c66ad49acf77f0e875327f07d4ab65a4d7921dce9d41d6f421665a2b467b/Firefox%20Installer.exe", "FirefoxInstaller");
}



/*
 * API part
 */

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
        softwares.forEach(function(soft) {
            var div = document.createElement('div');
            div.className = 'element1';
            var label = document.createElement('label');
            label.className = 'container';
            var img = document.createElement('img');
            img.className = 'logo';
            img.src =  soft.icon_url;
            var input = document.createElement('input');
            input.type = 'checkbox';
            var span = document.createElement('span');
            span.className = 'checkMarkLogo';
            var infos = document.createElement('div');
            infos.className = 'softTitle';
            infos.textContent = soft.name;
            var a = document.createElement('a');
            a.href = '#';
            var aimg = document.createElement('img');
            aimg.className = 'info';
            aimg.src = 'assets/svg/info.svg';
            label.appendChild(img);
            label.appendChild(input);
            label.appendChild(span);
            a.appendChild(aimg);
            infos.appendChild(a);
            div.appendChild(label);
            div.appendChild(infos);
            container.appendChild(div);
        });
    }
    else
    {
        console.log('Error: Failed to get softwares.');
        if (!API.isStillLoggedIn())
            deleteUser(false);
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
    db.transaction(["user"], "readwrite")
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

    db.transaction(["user"], "readwrite")
        .objectStore("user")
        .delete(1);
    window.location = "login.html";
}
