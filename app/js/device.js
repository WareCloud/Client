var DeviceManager =
{
    devices: [],

    addDevice: function(id, device)
    {
        deviceExists = this.getDeviceByIp(device.ip);
        if (deviceExists !== null)
        {
            deviceExists.id = id;
            return;
        }

        device.details = null;
        device.id = id;
        device.newWebsocket = function()
        {
            device.websocket = new WebSocket('ws://' + device.ip + ':' + 8000);
            device.websocket.onopen = function(evt)
            {
                console.log('CONNECTED TO ' + device.websocket.url);
                setDeviceAvailability(device.id, true);
            };

            device.websocket.onmessage = function(evt)
            {
                try {
                    var details = JSON.parse(evt.data);
                    device.details = details;
                    setDeviceAgentDetails(device.id, details);
                }
                catch(e) {
                    console.log('ERROR PARSING JSON! ERROR: ' + e);
                }
            };

            device.websocket.onclose = function(evt)
            {
                console.log('DISCONNECTED FROM ' + device.websocket.url);
                setDeviceAvailability(device.id, false);

                if (InstallManager.installing)
                    InstallManager.devices.forEach(function(dev) {
                        if (device.ip === dev.ip)
                            InstallManager.handleDisconnected(device);
                    });
            };

            device.getStatus = function()
            {
                return device.websocket.readyState;
            };

            device.close = function()
            {
                if (device.websocket.readyState !== device.websocket.OPEN)
                    device.websocket.close();
            };

            device.isOnline = function()
            {
                return (device.websocket.readyState === device.websocket.OPEN)
            };

            device.send = function(msg)
            {
                if(device.isOnline())
                    device.websocket.send(msg);
            };

            setTimeout(device.close, 3000);
        };

        device.newWebsocket();

        this.devices.push(device);
    },

    getDevices: function(id = null)
    {
        if (id !== null)
            return this.devices[id];

        return this.devices;
    },

    getDeviceByIp: function(ip)
    {
        var device = null;
        this.devices.forEach(function(dev){
            if (dev.ip === ip)
                device = dev;
        });

        return device;
    },

    refreshDevicesStatus: function()
    {
        this.devices.forEach(function(device){
            if (device.isOnline())
                setDeviceAvailability(device.id, true);
            else
                device.newWebsocket();
        });
    }
};