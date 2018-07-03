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

    handleDisconnected: function(device)
    {
        json = {'error': 'DEVICE DISCONNECTED'};
        InstallManager.logError(device, json);
        InstallManager.displayProgress();
    },

    handleConnected: function(device, json)
    {

    },

    handleInstall: function(device, json)
    {
        // TODO: FIX agent json.path/json.command
        var currentInstall = InstallManager.currentInstall[device.ip][json.command];

        if (json.type === 'OK_INSTALL')
        {
            // TODO: fix agent bug (only one install name)
            /*
            currentInstall.status = InstallManager.status.INSTALLED;
            if (InstallManager.getSoftwares(json.command.replace('.exe', '')).status === InstallManager.status.CONFIGURED)
                setTimeout(function() { device.send('configure ' + currentInstall.name); }, 1000);
            */
        }
        else
            InstallManager.logError(device, json, currentInstall);
    },

    handleFollow: function(device, json)
    {
        var currentInstall = InstallManager.currentInstall[device.ip][json.path];

        if (json.type === 'F_RUNNING')
        {
            currentInstall.status = InstallManager.status.DOWNLOADED;
            setTimeout(function(){ device.send('follow ' + json.path) }, 1000);
        }
        else if (json.type === 'F_FINISH')
        {
            currentInstall.status = InstallManager.status.INSTALLED;
            if (InstallManager.getSoftwares(json.path.replace('.exe', '')).status === InstallManager.status.CONFIGURED)
                setTimeout(function() { device.send('configure ' + currentInstall.name); }, 1000);
        }
        else
            InstallManager.logError(device, json, currentInstall);
    },

    handleDownload: function(device, json)
    {
        var currentInstall = InstallManager.currentInstall[device.ip][json.path];

        if (json.type === 'F_RUNNING')
        {
            //TODO: update progress
            if (json.command >= 100)
            {
                currentInstall.status = InstallManager.status.DOWNLOADED;
                device.send('install ' + json.path);
            }
        }
        else
            InstallManager.logError(device, json, currentInstall);
    },

    handleConfigure: function(device, json)
    {
        var currentInstall = InstallManager.currentInstall[device.ip][json.path];

        if (json.type === 'OK_CONFIGURATION')
            currentInstall.status = InstallManager.status.CONFIGURED;
        else
            InstallManager.logError(device, json, currentInstall);
    },

    handleUninstall: function(device, json)
    {

    },

    handleMessage: function(device, event)
    {
        var messages = {
            1: InstallManager.handleConnected,
            2: InstallManager.handleInstall,
            3: InstallManager.handleFollow,
            4: InstallManager.handleDownload,
            5: InstallManager.handleConfigure,
            6: InstallManager.handleUninstall,

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

    configurationIsSelected: function(softwareId)
    {
        var selected = false;
        [].forEach.call(document.getElementsByName('config-' + softwareId), function(element) {
            if (element.getElementsByTagName('input')[1].checked && element.style.display !== 'none')
                selected = true;
        });

        return selected;
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

    displayProgress: function()
    {
        var progress = InstallManager.getProgress();

        InstallManager.progress.setProgress(progress);
        if (progress >= 1.0)
        {
            InstallManager.devices.forEach(function(dev) {
                dev.websocket.onmessage = function(event){ console.log('RECEIVED MESSAGE: ' + event.data + ' FROM ' + dev.websocket.url); };
            });
            InstallManager.progress.stop(InstallManager.logs['ERROR'] === undefined);
            document.getElementsByClassName('textlogs')[0].textContent += (InstallManager.logs['ERROR'] === undefined ? 'SUCCESS!' : 'ERROR!');
            InstallManager.installing = false;
        }
    },

    setSoftwares: function()
    {
        softwares = {};

        [].forEach.call(document.getElementsByClassName('softwareElement'), function(element) {
            if (element.getElementsByTagName('input')[0].checked)
            {
                var soft = SoftwareManager.getSoftware(element.getAttribute('soft-id'));
                soft.status = InstallManager.configurationIsSelected(soft.id) ? InstallManager.status.CONFIGURED : InstallManager.status.INSTALLED;
                softwares[soft.name] = soft;
            }
        });

        InstallManager.softwares = softwares;
    },

    getSoftwares: function(software = null)
    {
        if (InstallManager.softwares[software] !== undefined)
            return InstallManager.softwares[software];

        return softwares;
    },

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

            device.websocket.onmessage = function(event)
            {
                InstallManager.handleMessage(device, event);
            };

            Object.keys(InstallManager.softwares).forEach(function(software) {
                var soft = InstallManager.softwares[software];
                var softwareExe = software + '.exe';
                InstallManager.currentInstall[device.ip][softwareExe] = {'id': soft.id, 'name': software, 'status': InstallManager.status.STARTED};
                //device.send('download ' + InstallManager.softwares[software].download_url + ' ' + softwareExe);
                device.send('install ' + software + '.exe');
                setTimeout(function(){ device.send('follow ' + software + '.exe'); }, 1000);
            });
        });
    }
};