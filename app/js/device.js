/*
 * The Device class
 * Manage the devices
 * Manage the devices' display
 */
var DeviceManager =
{
    devices: [],

    /*
     * Store a device and establish communication with the device
     * @param int id (the device's id)
     * @param json device (the device's json object)
     */
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
            // Try to establish a connection to the device
            device.websocket = new WebSocket('ws://' + device.ip + ':' + 8000);

            // The device is available
            device.websocket.onopen = function(evt)
            {
                console.log('CONNECTED TO ' + device.websocket.url);
                // Display that the device is available
                setDeviceAvailability(device.id, true);
            };

            // The device sent a message
            device.websocket.onmessage = function(evt)
            {
                // Get the device's informations and its installed softwares
                try {
                    var details = JSON.parse(evt.data);
                    device.details = details;
                    if (device.details.software)
                        device.details.software.arraySoft = device.details.software.arraySoft.sort((a, b) => a.name.localeCompare(b.name));

                    // Display the device informations
                    setDeviceAgentDetails(device.id, details);

                    device.websocket.onmessage = function(event)
                    {
                        InstallManager.handleMessage(device, event);
                    };
                }
                catch(e) {
                    console.log('ERROR PARSING JSON! ERROR: ' + e);
                }
            };

            // The device is not available anymore
            device.websocket.onclose = function(evt)
            {
                console.log('DISCONNECTED FROM ' + device.websocket.url);
                // Display that the device is unavailable
                setDeviceAvailability(device.id, false);

                if (InstallManager.installing)
                    InstallManager.devices.forEach(function(dev) {
                        if (device.ip === dev.ip)
                            InstallManager.handleDisconnected(device);
                    });
            };

            // Return the device status
            device.getStatus = function()
            {
                return device.websocket.readyState;
            };

            // Close the communication with the device
            device.close = function()
            {
                if (device.websocket.readyState !== device.websocket.OPEN)
                    device.websocket.close();
            };

            // Check if the device is online
            device.isOnline = function()
            {
                return (device.websocket.readyState === device.websocket.OPEN)
            };

            // Send a message to the device
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

    /*
     * Get the the details of a specified device
     * @param string ip (the device's ip)
     * @return json
     */
    getDeviceByIp: function(ip)
    {
        var device = null;
        this.devices.forEach(function(dev){
            if (dev.ip === ip)
                device = dev;
        });

        return device;
    },

    /*
     * Refresh the device status
     * If the device is now online, display that the device is available
     */
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