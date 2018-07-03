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
    logs: [],
    errors: [],
    progress: null,

    logError: function(device, json, currentInstall)
    {
        this.errors.push(new Date().toLocaleString() + ' FROM: ' + device.websocket.url + ' JSON: ' + JSON.stringify(JSON));
        currentInstall.status = InstallManager.status.FAILED;
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
                setTimeout(function() { device.websocket.send('configure ' + currentInstall.name); }, 1000);
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
            setTimeout(function(){ device.websocket.send('follow ' + json.path) }, 1000);
        }
        else if (json.type === 'F_FINISH')
        {
            currentInstall.status = InstallManager.status.INSTALLED;
            if (InstallManager.getSoftwares(json.path.replace('.exe', '')).status === InstallManager.status.CONFIGURED)
                setTimeout(function() { device.websocket.send('configure ' + currentInstall.name); }, 1000);
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
                device.websocket.send('install ' + json.path);
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

    handleError: function(device, json)
    {

    },

    handleMessage: function(device, event)
    {
        var messages = {
            1: this.handleConnected,
            2: this.handleInstall,
            3: this.handleFollow,
            4: this.handleDownload,
            5: this.handleConfigure,
            6: this.handleUninstall,

            20: this.handleError
        };

        this.logs.push(new Date().toLocaleString() + ' FROM: ' + device.websocket.url + ' MSG: ' + event.data);

        try {
            var json = JSON.parse(event.data);
        }
        catch (e) {
            this.errors.push(new Date().toLocaleString() + 'ERROR: ' + e + ' FROM: ' + device.websocket.url);
        }

        if (messages[json.id] !== undefined)
            messages[json.id](device, json);

        this.displayProgress();
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

        this.devices = devices;
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

        Object.keys(this.currentInstall).forEach(function(device) {
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

        Object.keys(this.softwares).forEach(function(soft) {
            total += InstallManager.softwares[soft].status;
        });

        total *= InstallManager.devices.length;

        Object.keys(this.currentInstall).forEach(function(device) {
            Object.keys(InstallManager.currentInstall[device]).forEach(function(software) {
                current += Math.max(InstallManager.status.STARTED, InstallManager.softwares[software.replace('.exe', '')].status - InstallManager.currentInstall[device][software].status);
            });
        });
        return ((total - current) / total);
    },

    displayProgress: function()
    {
        var progress = this.getProgress();

        this.progress.setProgress(progress);
        if (progress >= 1.0)
        {
            InstallManager.devices.forEach(function(dev) {
                dev.websocket.onmessage = function(event){ console.log('RECEIVED MESSAGE: ' + event.data + ' FROM ' + dev.websocket.url); };
            });
            this.progress.stop(this.errors.length === 0);
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

        this.softwares = softwares;
    },

    getSoftwares: function(software = null)
    {
        if (this.softwares[software] !== undefined)
            return this.softwares[software];

        return softwares;
    },

    install: function(progress)
    {
        this.progress = progress;
        this.setDevices();
        this.setSoftwares();
        this.currentInstall = {};
        this.logs = [];
        this.errors = [];

        this.devices.forEach(function(device) {

            InstallManager.currentInstall[device.ip] = {};

            device.websocket.onmessage = function(event)
            {
                InstallManager.handleMessage(device, event);
            };

            Object.keys(this.softwares).forEach(function(software) {
                var soft = InstallManager.softwares[software];
                var softwareExe = software + '.exe';
                InstallManager.currentInstall[device.ip][softwareExe] = {'id': soft.id, 'name': software, 'status': InstallManager.status.STARTED};
                //device.websocket.send('download ' + InstallManager.softwares[software].download_url + ' ' + softwareExe);
                device.websocket.send('install ' + software + '.exe');
                setTimeout(function(){ device.websocket.send('follow ' + software + '.exe'); }, 1000);
            });
        });
    }
};