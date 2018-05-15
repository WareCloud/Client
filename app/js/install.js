var InstallManager =
{
    currentInstall: {},

    getSelectedDevices: function()
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

        return devices;
    },

    getSelectedSoftwares: function()
    {
        var softwares = [];

        [].forEach.call(document.getElementsByClassName('softwareElement'), function(element) {
            if (element.getElementsByTagName('input')[0].checked)
                softwares.push(SoftwareManager.getSoftware(element.getAttribute('soft-id')))
        });

        return softwares;
    },

    configurationIsSelected: function(softwareId)
    {
        var selected = false;
        [].forEach.call(document.getElementsByName('config-' + softwareId), function(element) {
            if (element.getElementsByTagName('input')[0].checked && element.style.display !== 'none')
                selected = true;
        });

        return selected;
    },

    isFinished: function()
    {
        var finished = true;

        Object.keys(this.currentInstall).forEach(function(key) {
            if (InstallManager.currentInstall[key].finished === false)
                finished = false;
        });

        return finished;
    },

    install: function()
    {
        var devices = this.getSelectedDevices();
        var softwares = this.getSelectedSoftwares();
        var button = document.getElementById('install');

        this.currentInstall = {};

        devices.forEach(function(device) {
            button.value = 'INSTALLING...';
            device.websocket.onmessage = function (event)
            {
                console.log('RECEIVED MESSAGE ' + event.data);

                var json = JSON.parse(event.data);
                if (json.id === 3 && json.type === "F_RUNNING")
                    setTimeout(function(){ device.websocket.send('follow ' + json.path) }, 1000);
                else if (json.id === 3 && json.type === "F_FINISH")
                {
                    InstallManager.currentInstall[json.path].finished = true;

                    if (InstallManager.configurationIsSelected(InstallManager.currentInstall[json.path].id))
                        setTimeout(function(){ device.websocket.send('configure ' + InstallManager.currentInstall[json.path].name); }, 1000);

                    if (InstallManager.isFinished())
                    {
                        device.websocket.onmessage = function (event){};
                        button.value = 'INSTALL';
                    }
                }
            };

            softwares.forEach(function(software) {
                var softwareExe = software.name + '.exe';
                InstallManager.currentInstall[softwareExe] = {'id': software.id, 'name': software.name, 'finished': false};

                device.websocket.send('install ' + software.name + '.exe');
                setTimeout(function(){ device.websocket.send('follow ' + software.name + '.exe'); }, 1000);
            });
        });
    }
};