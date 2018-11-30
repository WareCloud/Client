/*
 * The InstallManager class
 * Manage installations on devices
 * Manage the devices' installation display
 */
var InstallManager =
{
    status: {
        STARTED:    0,
        DOWNLOADED: 1,
        INSTALLED:  2,
        CONFIGURED: 3,
        FINISHED:   4,
        FAILED:     5
    },

    protocol: {
        CONNECTED:  1,
        INSTALL:    2,
        FOLLOW:     3,
        DOWNLOAD:   4,
        CONFIGURE:  5,
        UNINSTALL:  6,
        DL_CONFIG:  7,
        PING:       8,

        ERROR:      20
    },

    devices: [],
    softwares: {},
    currentInstall: {},
    logs: {},
    progress: null,
    installing: false,

    logError: function(device, json, currentInstall = null)
    {
        InstallManager.log(device, json, "ERROR");

        if (currentInstall !== null)
            currentInstall.status = InstallManager.status.FAILED;
        else
            Object.keys(InstallManager.currentInstall[device.ip]).forEach(function(install) {
                InstallManager.currentInstall[device.ip][install].status = InstallManager.status.FAILED;
            });
    },

    log(device, json, type = "INFO")
    {
        if (InstallManager.logs[type] === undefined)
            InstallManager.logs[type] = [];

        var msg = new Date().toLocaleString() + ' FROM: ' + device.websocket.url + ' JSON: ' + JSON.stringify(json);
        InstallManager.logs[type].push(msg);

        document.getElementsByClassName('textlogs')[0].textContent += '[' + type + '] ' + msg + '\n';
    },

    sendCommand(device, command, software, file = null, url = null, path = null, extension = null, timeout = 0)
    {
        var message = {
            'command': command,
            'software': {
                'name': software,
                'file': file,
                'url': url,
                'path': path,
                'extension': extension
            }
        };
        console.log(message);

        setTimeout(device.send(JSON.stringify(message), timeout));
    },

    /*
     * The device is disconnected
     * Refresh the progress display and display an error
     * @param json device
     */
    handleDisconnected: function(device)
    {
        var json = {'error': 'DEVICE DISCONNECTED'};
        InstallManager.logError(device, json);
        InstallManager.displayProgress();
    },

    handleConnected: function(device, json)
    {
        //console.log('DETAILS');
        device.details = json;
        if (device.details.software)
          device.details.software.arraySoft = device.details.software.arraySoft.sort((a, b) => a.name.localeCompare(b.name));
    },

    /*
     * Handle the installation's status for a given device after receiving a message from it
     * @param json device (the device's json object)
     * @param json json (the message sent)
     */
    handleInstall: function(device, json)
    {
        // TODO: FIX agent json.path/json.command
        var currentInstall = InstallManager.currentInstall[device.ip][json.name];

        if (json.type === 'OK_INSTALL')
        {
            //
            currentInstall.status = InstallManager.status.INSTALLED;
            var software = InstallManager.getSoftwares(json.name);
            if (software.status === InstallManager.status.CONFIGURED)
                if (software.config !== null)
                    InstallManager.sendCommand(device, 'download_cfg', json.name, software.config.filename, API.getRootURL() + '/configs/' + software.config.filename, null, software.config.extension, null, 1000);
            //
                /*
                // TODO: fix agent bug (only one install name)
                currentInstall.status = InstallManager.status.INSTALLED;
                if (InstallManager.getSoftwares(json.command.replace('.exe', '')).status === InstallManager.status.CONFIGURED)
                {
                    console.log(currentInstall.config);
                    if (currentInstall.config !== null)
                        setTimeout(function() { device.send('download_cfg ' + API.getRootURL() + '/configs/' + currentInstall.config.filename + ' ' + currentInstall.config.filename); }, 1000);
                    //setTimeout(function() { device.send('configure ' + currentInstall.name); }, 1000);
                }
                */
        }
        else
            InstallManager.logError(device, json, currentInstall);
    },

    /*
     * Follow the installation of a given device
     * @param json device (the device's json object)
     * @param json json (the message sent)
     */
    handleFollow: function(device, json)
    {
        var currentInstall = InstallManager.currentInstall[device.ip][json.name];

        if (json.type === 'F_RUNNING')
        {
            currentInstall.status = InstallManager.status.DOWNLOADED;
            InstallManager.sendCommand(device, 'follow', json.name, json.name + '.exe', null, null, null, 1000);
            //setTimeout(function(){ device.send('follow ' + json.path) }, 1000);
        }
        else if (json.type === 'F_FINISH')
        {
            /*
            currentInstall.status = InstallManager.status.INSTALLED;
            var software = InstallManager.getSoftwares(json.name);
            if (software.status === InstallManager.status.CONFIGURED)
            {
                if (software.config !== null)
                    InstallManager.sendCommand(device, 'download_cfg', json.name, software.config.filename, API.getRootURL() + '/configs/' + software.config.filename, null, software.config.extension, null, 1000);
                    //setTimeout(function() { device.send('download_cfg ' + API.getRootURL() + '/configs/' + software.config.filename + ' ' + software.config.filename); }, 1000);
                    //setTimeout(function() { device.send('download_cfg ' + software.config.filename + ' ' + API.getRootURL() + '/configs/' + software.config.filename); }, 1000);
            }
            */
        }
        else
            InstallManager.logError(device, json, currentInstall);
    },

    /*
     * Follow the download of a software for a given device
     * @param json device (the device's json object)
     * @param json json (the message sent)
     */
    handleDownload: function(device, json)
    {
        var currentInstall = InstallManager.currentInstall[device.ip][json.name];

        if (json.type === 'F_RUNNING' || json.type === 'F_FINISH')
        {
            //TODO: update progress
            if (json.command >= 100)
            {
                currentInstall.status = InstallManager.status.DOWNLOADED;
                InstallManager.sendCommand(device, 'install', json.name, json.name.replace(' ', '') + '.exe');
                InstallManager.sendCommand(device, 'follow', json.name, json.name.replace(' ', '') + '.exe', null, null, null, 1000);
                //device.send('install ' + json.path);
                //setTimeout(function(){ device.send('follow ' + json.path); }, 1000);
            }
        }
        else
            InstallManager.logError(device, json, currentInstall);
    },

    /*
     * Handle the the donwnload of a configuration for a given device
     * @param json device (the device's json object)
     * @param json json (the message sent)
     */
    handleDownloadConfiguration: function(device, json)
    {
        var currentInstall = InstallManager.currentInstall[device.ip][json.name];

        var software = InstallManager.getSoftwares(json.name);
        if (json.type === 'OK_CONFIGURATION')
            currentInstall.status = InstallManager.status.CONFIGURED;
        else if (json.type === 'F_FINISH')
            InstallManager.sendCommand(device, 'configure', json.name, software.config.filename, null, software.config.path, software.config.extension);
            //device.send('configure ' + json.path);
        else if (json.type !== 'F_RUNNING')
            InstallManager.logError(device, json, currentInstall);
    },


    /*
     * Handle the configuration of a software for a given device
     * @param json device (the device's json object)
     * @param json json (the message sent)
     */
    handleConfigure: function(device, json)
    {
        var currentInstall = InstallManager.currentInstall[device.ip][json.name];
        var software = InstallManager.getSoftwares(json.name);

        console.log('CONFIG');
        console.log(currentInstall);
        if (json.type === 'OK_CONFIGURATION')
            currentInstall.status = InstallManager.status.CONFIGURED;
        else if (json.type === 'F_FINISH')
            InstallManager.sendCommand(device, 'configure', json.name, software.config.filename, null, software.config.path, software.config.extension);
            //device.send('configure ' + json.path);
        else
            InstallManager.logError(device, json, currentInstall);
    },

    handleUninstall: function(device, json)
    {

    },

    handleError: function(device, json)
    {

    },

    handlePing: function(device, json)
    {
        // console.log('PING');
        device.time = Date.now();
    },

    /*
     * Handle the message sent by a device
     * @param json device (the device's json object)
     * @param string event (the event)
     */
    handleMessage: function(device, event)
    {
        var messages = {
            1: InstallManager.handleConnected,
            2: InstallManager.handleInstall,
            3: InstallManager.handleFollow,
            4: InstallManager.handleDownload,
            5: InstallManager.handleConfigure,
            6: InstallManager.handleUninstall,
            7: InstallManager.handleDownloadConfiguration,
            8: InstallManager.handlePing,

            20: InstallManager.handleError
        };

        InstallManager.log(device, {'MSG': event.data});

        try {
            var json = JSON.parse(event.data);
        }
        catch (e) {
            InstallManager.logError(device, {'ERROR': e});
        }

        if (device.isOnline() && messages[json.id] !== undefined)
            messages[json.id](device, json);

        InstallManager.displayProgress();
    },

    /*
     * Store the selected devices
     */
    setDevices: function()
    {
        var devices = [];
        [].forEach.call(document.getElementsByClassName('deviceElement'), function(element) {
            if (element.getElementsByTagName('input')[0].checked)
            {
                var device = DeviceManager.getDeviceByIp(element.getAttribute('device-ip'));
                if (device !== null && device.isOnline())
                    devices.push(device);
            }
        });

        InstallManager.devices = devices;
    },

    /*
     * Check if the specified software needs to be configured
     * @param int softwareId (the software's id)
     * @return boolean
     */
    configurationIsSelected: function(softwareId)
    {
        var selected = false;
        [].forEach.call(document.getElementsByName('config-' + softwareId), function(element) {
            if (element.getElementsByTagName('input')[1].checked && element.style.display !== 'none')
                selected = true;
        });

        return selected;
    },

    /*
     * Return the selected configuration for a given software
     * @param int softwareId (the software's id)
     * @return object
     */
    getSelectedConfiguration: function(softwareId)
    {
        var configId = null;
        [].forEach.call(document.getElementsByName('config-' + softwareId), function(element) {
            if (element.getElementsByTagName('input')[1].checked && element.style.display !== 'none')
                configId = element.getAttribute('config-id');
        });

        if (configId === null)
            return null;

        return ConfigurationManager.getConfiguration(configId);
    },

    isFinished: function()
    {
        var finished = true;

        Object.keys(InstallManager.currentInstall).forEach(function(device) {
            Object.keys(InstallManager.currentInstall[device]).forEach(function(software) {
                if (InstallManager.softwares[software].status - InstallManager.currentInstall[device][software].status > 0)
                    finished = false;
            });
        });

        return finished;
    },

    /*
     * Return the progress of the installation
     * @return float
     */
    getProgress: function()
    {
        var total = 0;
        var current = 0;

        Object.keys(InstallManager.softwares).forEach(function(soft) {
            total += InstallManager.softwares[soft].status;
        });

        total *= InstallManager.devices.length;

        Object.keys(InstallManager.currentInstall).forEach(function(device) {
            Object.keys(InstallManager.currentInstall[device]).forEach(function(software) {
                current += Math.max(InstallManager.status.STARTED, InstallManager.softwares[software.replace('.exe', '')].status - InstallManager.currentInstall[device][software].status);
            });
        });
        return ((total - current) / total);
    },

    /*
     * Display the progress of the installation
     */
    displayProgress: function()
    {
        if (!InstallManager.installing)
            return;

        var progress = InstallManager.getProgress();

        InstallManager.progress.setProgress(progress);
        if (progress >= 1.0)
        {
            /*
            InstallManager.devices.forEach(function(dev) {
                dev.websocket.onmessage = function(event){ console.log('RECEIVED MESSAGE: ' + event.data + ' FROM ' + dev.websocket.url); };
            });
            */
            InstallManager.devices.forEach(function(dev) {
                dev.time = undefined;
                clearInterval(dev.interval);
            });
            InstallManager.progress.stop(InstallManager.logs['ERROR'] === undefined);
            document.getElementsByClassName('textlogs')[0].textContent += (InstallManager.logs['ERROR'] === undefined ? 'SUCCESS!' : 'ERROR!');
            InstallManager.installing = false;
        }
    },

    /*
     * Set the softwares to install
     */
    setSoftwares: function()
    {
        softwares = {};

        [].forEach.call(document.getElementsByClassName('softwareElement'), function(element) {
            if (element.getElementsByTagName('input')[0].checked)
            {
                var soft = SoftwareManager.getSoftware(element.getAttribute('soft-id'));
                soft.status = InstallManager.configurationIsSelected(soft.id) ? InstallManager.status.CONFIGURED : InstallManager.status.INSTALLED;
                soft.config = InstallManager.getSelectedConfiguration(soft.id);
                softwares[soft.name] = soft;
            }
        });

        InstallManager.softwares = softwares;
    },

    /*
     * Return the softwares to isntall
     * @return array
     */
    getSoftwares: function(software = null)
    {
        if (InstallManager.softwares[software] !== undefined)
            return InstallManager.softwares[software];

        return softwares;
    },

    sendPing: function(device)
    {
        var currentTime = Date.now();
        //console.log(device.time);
        //console.log(currentTime);
        //console.log(currentTime - device.time);
        if (device.time && (currentTime - device.time) > 3000)
        {
            if (device.interval)
                clearInterval(device.interval);

            InstallManager.logError(device, {error: 'Can\'t ping device'});
            InstallManager.displayProgress();
        }
        else
            InstallManager.sendCommand(device, 'ping', null);
    },

    /*
     * Install the selected softwares
     */
    install: function(progress)
    {
        InstallManager.progress = progress;
        InstallManager.setDevices();
        InstallManager.setSoftwares();
        InstallManager.currentInstall = {};
        InstallManager.logs = {};
        InstallManager.installing = true;

        document.getElementsByClassName('textlogs')[0].textContent = '';

        InstallManager.devices.forEach(function(device) {

            InstallManager.currentInstall[device.ip] = {};

            /*
            device.websocket.onmessage = function(event)
            {
                InstallManager.handleMessage(device, event);
            };
            */
            device.interval = setInterval(function() { InstallManager.sendPing(device); }, 1000);
            Object.keys(InstallManager.softwares).forEach(function(software) {
                var soft = InstallManager.softwares[software];
                //var softwareExe = software + '.exe';
                InstallManager.currentInstall[device.ip][software] = {'id': soft.id, 'name': software, 'status': InstallManager.status.STARTED};
                InstallManager.sendCommand(device, 'download', software, software.replace(' ', '') + '.exe', InstallManager.softwares[software].download_url);
                //device.send('download ' + InstallManager.softwares[software].download_url + ' ' + softwareExe);
                //device.send('install ' + software + '.exe');
                //setTimeout(function(){ device.send('follow ' + software + '.exe'); }, 1000);
            });
        });
    },

    /*
     * Uninstall a software for a given device
     * @param string ip (the device's ip)
     * @param string software (the software to uninstall)
     */
    uninstall: function(ip, software)
    {
        var device = DeviceManager.getDeviceByIp(ip);
        if (!device)
            return;

        InstallManager.sendCommand(device, 'uninstall', software, software);
        //device.send('uninstall ' + software);
    }
};
