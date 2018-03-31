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



/*
 * Agent part
 */

var agentTest = null;
function connectAgent()
{
    agentTest = new Agent(0, '127.0.0.1', '8000');
    agentTest.connect();
}

function installAgent()
{
    agentTest.install('FirefoxInstaller');
}

function downloadAgent()
{
    agentTest.download('https://stubdownloader.cdn.mozilla.net/builds/firefox-stub/fr/win/9705c66ad49acf77f0e875327f07d4ab65a4d7921dce9d41d6f421665a2b467b/Firefox%20Installer.exe', 'FirefoxInstaller');
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
        var error = '';
        for (var key in result.errors)
            error += result.errors[key] + '<br>';

        var loginError = document.getElementById('login-error');
        loginError.innerHTML = '<strong>Error ! </strong>' + error;
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
        var error = '';
        for (var key in result.errors)
            error += result.errors[key] + '<br>';

        var loginError = document.getElementById('login-error');
        loginError.innerHTML = '<strong>Error ! </strong>' + error;
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

var softs = [];
function saveSoftwares()
{
    var result = API.getSoftware();

    if (result.success)
    {
        console.log('Content: ' + result.data);
        softs = result.data;
    }
    else
    {
        console.log('Error: Failed to get softwares.');
        if (!API.isStillLoggedIn())
            deleteUser(false);
    }
}

function getSoftware(id)
{
    var software = null;
    softs.forEach(function(soft){
        if (soft.id === id)
            software = soft;
    });

    return software;
}

function displaySoftwares()
{
    var container = document.getElementById('softwareTable');
    container.innerHTML = '';

    softs.forEach(function(soft) {
        var div = document.createElement('div');
        div.className = 'softwareElement';
        div.setAttribute('soft-id', soft.id);
        var label = document.createElement('label');
        label.className = 'container';
        var img = document.createElement('img');
        img.className = 'logo';
        img.src = API.getRootURL() + soft.icon_url;
        var input = document.createElement('input');
        input.type = 'checkbox';
        var span = document.createElement('span');
        span.className = 'checkMarkLogo';
        var infos = document.createElement('div');
        infos.className = 'softTitle';
        var fit = document.createElement('div');
        fit.className = 'fit';
        var wrap = document.createElement('span');
        wrap.className = 'wrap';
        wrap.textContent = soft.name;
        var a = document.createElement('a');
        a.className = 'soft-info';
        var aimg = document.createElement('img');
        aimg.className = 'info';
        aimg.src = 'assets/svg/info.svg';
        var adesc = document.createElement('a');
        adesc.className = 'active';
        adesc.style.display = 'none';

        label.appendChild(img);
        label.appendChild(input);
        label.appendChild(span);
        fit.appendChild(wrap);
        a.appendChild(aimg);
        infos.appendChild(fit);
        infos.appendChild(a);
        div.appendChild(label);
        div.appendChild(infos);
        div.appendChild(adesc);
        container.appendChild(div);

        fontFitResize(fit, wrap);
    });
    initSoftwaresDescriptions();
    window.addEventListener('resize', function() { resetSoftwareDescription() });
    resetSoftwareDescription();
}

function displayDevices()
{
    var container = document.getElementById('deviceTable');
    container.innerHTML = '';

    var arp = new ARP();
    arp.getDevices().forEach(function(device){
        var element = document.createElement('div');
        element.className = 'deviceElement';
        var containerElement = document.createElement('label');
        containerElement.className = 'containerElement';
        var elementName = document.createElement('p');
        elementName.className = 'elementName';
        elementName.textContent = device.ip;
        var input = document.createElement('input');
        input.type = 'checkbox';
        var span = document.createElement('span');
        span.className = 'checkMark';
        var menu = document.createElement('div');
        menu.tabIndex = 0;
        menu.className = 'onclick-menu';
        var menuContent = document.createElement('div');
        menuContent.className = 'onclick-menu-content';
        menuContent.innerHTML = 'MAC address : ' + device.mac + '<br>' + 'IP : ' + device.ip;

        containerElement.appendChild(elementName);
        containerElement.appendChild(input);
        containerElement.appendChild(span);
        menu.appendChild(menuContent);
        element.appendChild(containerElement);
        element.appendChild(menu);
        container.appendChild(element);
    });
}

var confs = [];
function saveConfigurations()
{
    var result = API.getConfiguration();

    if (result.success) {
        console.log('Content: ' + result.data);

        confs = result.data;
        confs.sort(function(a, b) {
            return (a.software.id > b.software.id) ? 1 : ((b.software.id > a.software.id) ? -1 : 0);
        });
    }
    else
    {
        console.log('Error: Failed to get configurations.');
        if (!API.isStillLoggedIn())
            deleteUser(false);
    }
}

function displayConfigurations()
{
    var container = document.getElementById('configTable');
    container.innerHTML = '';

    confs.forEach(function(conf) {
        var element = document.createElement('div');
        element.className = 'configElement';
        element.setAttribute('name', 'config-' + conf.software.id);
        element.style.display = 'none';
        var containerElement = document.createElement('label');
        containerElement.className = 'containerElement containerConfig';
        containerElement.setAttribute('name', 'container-config-' + conf.software.id);
        var elementName = document.createElement('p');
        elementName.className = 'elementName';
        elementName.textContent = conf.software.name;
        var input = document.createElement('input');
        input.type = 'checkbox';
        var span = document.createElement('span');
        span.className = 'checkMark';
        var iconConfig = document.createElement('div');
        iconConfig.className = 'iconConfig';
        var iconSVG = document.createElement('img');
        iconSVG.className = 'iconSVG';
        iconSVG.src = API.getRootURL() + getSoftware(conf.software.id).icon_url;

        containerElement.appendChild(elementName);
        containerElement.appendChild(input);
        containerElement.appendChild(span);
        iconConfig.appendChild(iconSVG);
        element.appendChild(containerElement);
        element.appendChild(iconConfig);
        container.appendChild(element);
    });

    [].forEach.call(document.getElementsByClassName('container'), function(el) {
        el.addEventListener('click', function() {
            document.getElementsByName('config-' + el.parentNode.getAttribute('soft-id')).forEach(function (conf) {
                conf.style.display = el.getElementsByTagName('input')[0].checked === true ? 'block' : 'none';
            });
        });
    });
    [].forEach.call(document.getElementsByClassName('containerConfig'), function(el) {
        el.addEventListener('click', function() {
            [].forEach.call(document.getElementsByName(el.getAttribute('name')), function(container){
                if (el === container)
                    return;

                container.getElementsByTagName('input')[0].checked = false;
            });
        });
    });
}

function loadUser()
{
    var transaction = db.transaction(['user']);
    var objectStore = transaction.objectStore('user');
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
    db.transaction(['user'], 'readwrite')
        .objectStore('user')
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

    db.transaction(['user'], 'readwrite')
        .objectStore('user')
        .delete(1);
    window.location = 'login.html';
}
