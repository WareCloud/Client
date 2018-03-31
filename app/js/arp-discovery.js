class ARP {
    constructor() {
        this.fs = require('fs');
    }

    displayDevices(devices) {
        var ret = '';
        devices.forEach(function(device) {
            ret += '<tr><td></td><td>' + device.ip + '</td><td>' + device.mac + '</td><td></td><td></td></tr>';
        });
        return ret;
    }

    getDevices() {
        var devices = [];
        if (process.platform === 'win32') {
            const {execSync} = require('child_process');
            var result = execSync('arp -a').toString().split('\n');
            result.forEach(function(line){
                if (line.indexOf('dynamique') === -1)
                    return;

                var cols = line.replace(/ [ ]*/g, ' ').split(' ');
                devices.push({
                    ip: cols[1],
                    mac: cols[2]
                });
            });
        }
        else {
            this.fs.readFile('/proc/net/arp', function (err, data) {
                if (!!err) return done(err, null);

                var lines = data.toString().split('\n');
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
            });
        }
        return devices;
    }
}

