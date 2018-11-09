/*
 * The ARP class
 * Detects devices on the internal network using the ARP protocol
 */
var ARP =
{
    fs: require('fs'),
    devices: [],

    addDevice: function(ip)
    {
        devices.push({ip: ip, mac: '00-00-00-00-00'})
    }
    
    displayDevices: function(devices)
    {
        var ret = '';
        devices.forEach(function(device) {
            ret += '<tr><td></td><td>' + device.ip + '</td><td>' + device.mac + '</td><td></td><td></td></tr>';
        });
        return ret;
    },

    /*
     * Store the internal network's devices
     */
    refreshDevices: function()
    {
        var devices = [];
        // Check if the platform is Windows
        if (process.platform === 'win32')
        {
            const {execSync} = require('child_process');
            var result = execSync('arp -a').toString().split('\n');
            result.forEach(function(line){
                //if (line.indexOf('dynamique') === -1)
                //    return;

                var cols = line.replace(/ [ ]*/g, ' ').split(' ');
                if (/\b(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\b/.test(cols[1])
                    && /(?:[0-9a-f]{2}-){5}[0-9a-f]{2}/.test(cols[2]) && cols[2] !== 'ff-ff-ff-ff-ff-ff' // Broadcast IPs
                    && !cols[1].startsWith('224.0.0') && !cols[2].startsWith('01-00-5e')) // Multicast IPs
                    devices.push({
                        ip: cols[1],
                        mac: cols[2]
                    });
            });
        }
        // The platform is Unix
        else
        {
            var lines = this.fs.readFileSync('/proc/net/arp').toString().split('\n');
            lines.splice(0, 1);

            lines.forEach(function(line){
                var cols = line.replace(/ [ ]*/g, ' ').split(' ');

                if ((cols.length > 3) && (cols[0].length !== 0) && (cols[3].length !== 0) && cols[3] !== '00:00:00:00:00:00') {
                    devices.push({
                        ip: cols[0],
                        mac: cols[3]
                    });
                }
            });
        }
        devices.push({ip: 'localhost', mac:'00-00-00-00-00'});
        this.devices = devices.sort((a, b) => a.ip.localeCompare(b.ip)).filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj['mac']).indexOf(obj['mac']) === pos;
        });
    },

    /*
     * Get the internal network's devices
     * If the refresh parameter is present, refresh the network's devices before the returning them
     * @param boolean refresh (whether to refresh the devices)
     * @return array
     */
    getDevices: function(refresh = false)
    {
        if (refresh)
            this.refreshDevices();

        return this.devices;
    }
};

