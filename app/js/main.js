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
    {
        console.log('URL: ' + result.data.download_url);
        saveSoftwares();
    }
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

function saveSoftwares()
{
    var result = API.getSoftware();

    if (result.success)
    {
        result.data.forEach(function(soft){
            SoftwareManager.addSoftware(soft);
        });
    }
    else {
        console.log('Error: Failed to get softwares');
        if (!API.isStillLoggedIn())
            deleteUser(false);
    }
}

function getSoftware(id)
{
    var software = null;
    SoftwareManager.softwares.forEach(function(soft){
        if (soft.id === id)
            software = soft;
    });
    return software;
}

function displaySoftwares()
{
    var container = document.getElementById('softwareTable');
    container.innerHTML = '';
    SoftwareManager.getSoftware().forEach(function(soft) {
        var div = document.createElement('div');
        div.className = 'softwareElement';
        div.setAttribute('soft-id', soft.id);
        var label = document.createElement('label');
        label.className = 'container';
        label.setAttribute('name', 'soft-' + soft.id);
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

var displayUninstallMode = false;
function switchInstallMode(disp = null, force = true)
{
    if (force)
        switchBundleMode(true, false);

    displayUninstallMode = (disp === null) ? !displayUninstallMode : disp;
    displayUninstallMode ? displayUninstall() : displayInstall();
    document.getElementById('install').style.display = displayUninstallMode ? 'none' : 'block';
    document.getElementById('InstallModeButton').value = (displayUninstallMode ? 'Install' : 'Uninstall') + ' mode';
}

var displayInstallMode;
function switchBundleMode(disp = null, force = true)
{
    if (disp !== null)
        displayInstallMode = disp;

    if (force)
        switchInstallMode(false, false);

    document.getElementById('uninstallTable').innerHTML = '';
    displayInstallMode ? displayDevices() : displayBundles();
    document.getElementById('install').style.display = displayInstallMode ? 'none' : 'block';
    document.getElementById('BundleModeButton').value = (displayInstallMode ? 'Normal' : 'Bundle') + ' mode';
}

var displayLogs = false;
function switchLogs()
{
    displayLogs = !displayLogs;
    document.getElementById('displaylogs').text = (displayLogs ? 'Hide' : 'Display') + ' logs';
    document.getElementById('logs').style.display = displayLogs ? 'block' : 'none';
}

function displayInstall()
{
    document.getElementById('softwareColumn').style.display = 'block';
    document.getElementById('configColumn').style.display = 'block';
    document.getElementById('uninstallColumn').style.display = 'none';
}

function displayUninstall()
{
    document.getElementById('softwareColumn').style.display = 'none';
    document.getElementById('configColumn').style.display = 'none';
    document.getElementById('uninstallColumn').style.display = 'block';
}

function displayUninstallSoftwares()
{
    var container = document.getElementById('uninstallTable');
    container.innerHTML = '';

    if (displayInstallMode)
        return;

    var deviceEl = null;
    [].forEach.call(document.getElementsByClassName('deviceElement'), function(el) {
        if (el.getElementsByTagName('input')[0].checked)
            deviceEl = el;
    });

    if (!deviceEl)
        return;

    var device = DeviceManager.getDeviceByIp(deviceEl.getAttribute('device-ip'));
    if (!device || !device.details)
        return;

    var i = 0;
    device.details.software.arraySoft.forEach(function(soft){
        var element = document.createElement('div');
        element.className = 'uninstallElement';
        var softName = document.createElement('label');
        softName.className = 'uninstall softname';
        softName.textContent = soft.name;
        var softVersion = document.createElement('label');
        softVersion.className = 'uninstall softversion';
        softVersion.textContent = soft.version;
        var uninstallIcon = document.createElement('a');
        uninstallIcon.className = 'uninstall uninstallicon errorButton';
        uninstallIcon.onclick = function() { InstallManager.uninstall(device.ip, soft.name); };
        var img = document.createElement('img');
        img.className = 'uninstallerror';
        img.src = 'assets/svg/error.svg';

        uninstallIcon.appendChild(img);
        element.appendChild(softName);
        element.appendChild(softVersion);
        element.appendChild(uninstallIcon);

        container.appendChild(element);

        i++;
    });
}

function displayDevices()
{
    displayInstallMode = 0;
    var container = document.getElementById('deviceTable');
    container.innerHTML = '';

    var id = 0;
    ARP.getDevices(true).forEach(function(device){
        var deviceExists = DeviceManager.getDeviceByIp(device.ip);
        var online = (deviceExists !== null && deviceExists.isOnline());
        var element = document.createElement('div');
        element.className = 'deviceElement';
        element.setAttribute('device-ip', device.ip);
        element.setAttribute('online', online ? 'true' : 'false');
        var containerElement = document.createElement('label');
        containerElement.className = 'containerElement';
        containerElement.setAttribute('online', online ? 'true' : 'false');
        var deviceStatus = document.createElement('p');
        deviceStatus.className = 'deviceStatus';
        deviceStatus.innerHTML = '<svg class="statusSVG"><circle cx="10" cy="10" r="8" fill="'+ (online ? 'lime' : 'orange') + '" /></svg>';
        var elementName = document.createElement('p');
        elementName.className = 'elementName';
        elementName.textContent = device.ip;
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.disabled = !online;
        var span = document.createElement('span');
        span.className = 'checkMark';
        span.setAttribute('online', online ? 'true' : 'false');
        var menu = document.createElement('div');
        menu.tabIndex = 0;
        menu.className = 'onclick-menu';
        var menuContent = document.createElement('div');
        menuContent.className = 'onclick-menu-content';
        menuContent.innerHTML = 'MAC address : ' + device.mac + '<br>' + 'IP : ' + device.ip;

        containerElement.appendChild(deviceStatus);
        containerElement.appendChild(elementName);
        containerElement.appendChild(input);
        containerElement.appendChild(span);
        menu.appendChild(menuContent);
        element.appendChild(containerElement);
        element.appendChild(menu);
        container.appendChild(element);

        DeviceManager.addDevice(id, device);
        id++;
    });

    [].forEach.call(document.getElementsByClassName('containerElement'), function(el) {
        el.addEventListener('click', function() {
            event.preventDefault();

            if (el.getAttribute('online') === 'true')
                el.getElementsByTagName('input')[0].checked = !el.getElementsByTagName('input')[0].checked;

            displayConfirmButton();

            if (displayUninstallMode)
            {
                displayUninstallSoftwares();
                [].forEach.call(document.getElementsByClassName('containerElement'), function(container){
                    if (el === container)
                        return;

                    container.getElementsByTagName('input')[0].checked = false;
                });
            }
        });
    });
}

function saveBundles()
{
    var result = API.getBundle();

    if (result.success)
    {
        result.data.forEach(function(bundle){
            BundleManager.addBundle(bundle);
        });
    }
    else {
        console.log('Error: Failed to get bundles');
        if (!API.isStillLoggedIn())
            deleteUser(false);
    }
}

function displayBundles()
{
    displayInstallMode = 1;
    var container = document.getElementById('deviceTable');
    container.innerHTML = '';

    BundleManager.getBundle().forEach(function(bundle){
        var element = document.createElement('div');
        element.className = 'BundleElement';
        element.setAttribute('name', 'bundle-' + bundle.id);
        element.setAttribute('bundle-id', bundle.id);
        var containerElement = document.createElement('label');
        containerElement.className = 'containerElement';
        var elementName = document.createElement('input');
        elementName.className = 'elementName elementInput';
        elementName.type = 'text';
        elementName.placeholder = bundle.name;
        elementName.onblur = function() { BundleManager.renameBundle(bundle.id, elementName.value); };
        var input = document.createElement('input');
        input.type = 'checkbox';
        var a = document.createElement('a');
        a.className = 'errorButton';
        a.onclick = function() { BundleManager.deleteBundle(bundle.id); };
        var error = document.createElement('img');
        error.id = 'deleteBundle';
        error.className = 'error';
        error.src = 'assets/svg/error.svg';
        var span = document.createElement('span');
        span.className = 'checkMark';

        containerElement.appendChild(elementName);
        containerElement.appendChild(input);
        containerElement.appendChild(span);
        a.appendChild(error);
        element.appendChild(containerElement);
        element.appendChild(a);
        container.appendChild(element);
    });

    [].forEach.call(document.getElementsByClassName('BundleElement'), function(el) {
        el.addEventListener('click', function(event) {
            event.preventDefault();
            el.getElementsByTagName('input')[1].checked = !el.getElementsByTagName('input')[1].checked;
            if(el.getElementsByTagName('input')[1].checked)
            {
                var bundle = BundleManager.getBundle(el.getAttribute('bundle-id'));
                if (bundle !== null)
                {
                    bundle.bundle.forEach(function(element) {
                        if (element.configuration !== null)
                        {
                            var config = document.getElementById('config-' + element.configuration.id);
                            if (config !== undefined && !config.getElementsByTagName('input')[1].checked)
                                config.click();
                        }

                        var software = document.getElementsByName('soft-' + element.software.id)[0];
                        if (software !== undefined && !software.getElementsByTagName('input')[0].checked)
                            software.click();
                    })
                }
            }
        }, false);
    });
}

function saveConfigurations()
{
    var result = API.getConfiguration();

    if (result.success) {
        var configs = result.data;
        configs.sort(function(a, b) {
            return (a.software.id > b.software.id) ? 1 : ((b.software.id > a.software.id) ? -1 : 0);
        });
        configs.forEach(function(config){
            ConfigurationManager.addConfiguration(config);
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

    ConfigurationManager.getConfiguration().forEach(function(conf) {
        var element = document.createElement('div');
        element.className = 'configElement';
        element.setAttribute('name', 'config-' + conf.software.id);
        element.setAttribute('config-id', conf.id);
        element.style.display = 'none';
        var containerElement = document.createElement('label');
        containerElement.className = 'containerElement containerConfig';
        containerElement.setAttribute('name', 'container-config-' + conf.software.id);
        containerElement.id = 'config-' + conf.id;
        var elementName = document.createElement('input');
        elementName.className = 'elementName elementInput';
        elementName.type = 'text';
        elementName.placeholder = conf.name;
        elementName.onblur = function() { ConfigurationManager.renameConfiguration(conf.id, elementName.value); };
        var input = document.createElement('input');
        input.type = 'checkbox';
        var span = document.createElement('span');
        span.className = 'checkMark';
        var iconConfig = document.createElement('div');
        iconConfig.className = 'iconConfig';
        var iconSVG = document.createElement('img');
        iconSVG.className = 'iconSVG';
        iconSVG.src = API.getRootURL() + SoftwareManager.getSoftware(conf.software.id).icon_url;
        var a = document.createElement('a');
        a.className = 'errorButton';
        a.onclick = function() { ConfigurationManager.deleteConfiguration(conf.id); };
        var error = document.createElement('img');
        error.id = 'deleteConf';
        error.className = 'error';
        error.src = 'assets/svg/error.svg';

        containerElement.appendChild(elementName);
        containerElement.appendChild(input);
        containerElement.appendChild(span);
        a.appendChild(error);
        iconConfig.appendChild(iconSVG);
        iconConfig.appendChild(a);
        element.appendChild(containerElement);
        element.appendChild(iconConfig);
        container.appendChild(element);
    });

    [].forEach.call(document.getElementsByClassName('container'), function(el) {
        el.addEventListener('click', function() {
            displayCreateBundleButton();
            displayConfirmButton();
            document.getElementsByName('config-' + el.parentNode.getAttribute('soft-id')).forEach(function(conf) {
                conf.style.display = el.getElementsByTagName('input')[0].checked ? 'block' : 'none';
            });
        });
    });
    [].forEach.call(document.getElementsByClassName('containerConfig'), function(el) {
        el.addEventListener('click', function() {
            event.preventDefault();
            el.getElementsByTagName('input')[1].checked = !el.getElementsByTagName('input')[1].checked;
            [].forEach.call(document.getElementsByName(el.getAttribute('name')), function(container){
                if (el === container)
                    return;

                container.getElementsByTagName('input')[1].checked = false;
            });
        });
    });
}

function loadUser()
{
    var transaction = db.transaction(['user']);
    var objectStore = transaction.objectStore('user');
    var request = objectStore.get(1);

    request.onsuccess = function(event)
    {
        if (request.result !== undefined)
        {
            if (!API.setUser(request.result.user))
                deleteUser(false);
            else if (window.location.href.indexOf('login.html') !== -1)
                window.location = 'tabs.html';
            else
                loadContent();
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

function setDeviceAvailability(id, status)
{
    var deviceElement = document.getElementsByClassName('deviceElement')[id];
    if (deviceElement !== undefined)
    {
        deviceElement.setAttribute('online', status ? 'true' : 'false');
        deviceElement.getElementsByClassName('containerElement')[0].setAttribute('online', status ? 'true' : 'false');
        deviceElement.getElementsByTagName('input')[0].disabled = !status;
        deviceElement.getElementsByTagName('input')[0].checked = deviceElement.getElementsByTagName('input')[0].checked && status;
        deviceElement.getElementsByClassName('checkMark')[0].setAttribute('online', status ? 'true' : 'false');
        deviceElement.getElementsByClassName('deviceStatus')[0].innerHTML = '<svg class="statusSVG"><circle cx="10" cy="10" r="8" fill="' + (status ? 'lime' : 'red') + '" /></svg>';
    }

    displayConfirmButton();
}

function displayConfirmButton()
{
    if (InstallManager.installing)
        return;

    var install = document.getElementById('install');
    var button = install.getElementsByTagName('button')[0];

    var deviceSelected = false;
    var softwareSelected = false;

    [].forEach.call(document.getElementsByClassName('deviceElement'), function(el) {
        if (el.getAttribute('online') === 'true' && el.getElementsByTagName('input')[0].checked)
            deviceSelected = true;
    });

    [].forEach.call(document.getElementsByClassName('softwareElement'), function(el) {
        if (el.getElementsByTagName('input')[0].checked)
            softwareSelected = true;
    });

    button.disabled = (!deviceSelected || !softwareSelected);
}

function setDeviceAgentDetails(id, json)
{
    document.getElementsByClassName('onclick-menu-content')[id].innerHTML = document.getElementsByClassName('onclick-menu-content')[id].innerHTML + '<br>' + 'OS: ' + json.os + '<br>User: ' + json.user + '<br>Version: ' + json.version;
}

function refreshDevicesAvailbility()
{
    DeviceManager.refreshDevicesStatus();
}

function displayBundleName()
{
    document.getElementById('BundleName').style.display = 'block';
    document.getElementById('BundleSave').style.display = 'block';
    document.getElementById('CreateBundleButton').style.display = 'none';
}

function displayCreateBundleButton()
{
    var count = 0;
    var elms = document.getElementById('softwareTable').getElementsByTagName('input');
    for (var i = 0; i < elms.length; i++)
    {
        if (elms[i].checked)
            count++;
    }
    var button = document.getElementById('CreateBundleButton');
    button.disabled = (count <= 1);
    button.style.display = 'block';
    document.getElementById('BundleName').style.display = 'none';
    document.getElementById('BundleSave').style.display = 'none';
}

function updatePassword()
{
    var password = document.getElementById('profilePassword').value;
    var newPassword = document.getElementById('profileNewPassword').value;
    var newPasswordConfirmation = document.getElementById('profileNewPasswordConfirmation').value;

    var result = API.updatePassword(password, newPassword, newPasswordConfirmation);
    var message = document.getElementById('profileMessage');
    if (result.success)
    {
        message.className = 'alert alert-success';
        message.innerHTML = '<strong>Success ! </strong>' + result.data;
    }
    else
    {
        var error = '';
        for (var key in result.errors)
            error += result.errors[key] + '<br>';

        message.className = 'alert alert-danger';
        message.innerHTML = '<strong>Error ! </strong>' + error;
    }
}

function submitSoftwareSuggestion()
{
    var name = document.getElementById('softwareSuggestionName').value;
    var website = document.getElementById('softwareSuggestionWebsite').value;

    var result = API.postSoftwareSuggestion(name, website);
    var message = document.getElementById('suggestionMessage');
    if (result.success)
    {
        message.className = 'alert alert-success';
        message.innerHTML = '<strong>Success ! </strong>' + result.data;
    }
    else
    {
        var error = '';
        for (var key in result.errors)
            error += result.errors[key] + '<br>';

        message.className = 'alert alert-danger';
        message.innerHTML = '<strong>Error ! </strong>' + error;
    }
}

function submitBugReport()
{
    var name = document.getElementById('bugReportName').value;
    var description = document.getElementById('bugReportDescription').value;

    var result = API.postBug(name, description);
    var message = document.getElementById('bugReportMessage');
    if (result.success)
    {
        message.className = 'alert alert-success';
        message.innerHTML = '<strong>Success ! </strong>' + result.data;
    }
    else
    {
        var error = '';
        for (var key in result.errors)
            error += result.errors[key] + '<br>';

        message.className = 'alert alert-danger';
        message.innerHTML = '<strong>Error ! </strong>' + error;
    }
}
