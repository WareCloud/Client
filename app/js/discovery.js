class Device {
  constructor(ip, mac) {
    this.ip = ip;
    this.mac = mac;
  }

  getIp(){
    return this.ip;
  }
  getMac(){
    return this.mac;
  }
}

class Discovery{

  constructor() {
    this.fs = require('fs');
    this.devices = [];
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
            this.devices.push( new Device(col[1], col[2]) );
        });
    }
    else {
        var lines = this.fs.readFileSync('/proc/net/arp').toString().split('\n');
        lines.splice(0, 1);

        lines.forEach(function(line){
            var cols = line.replace(/ [ ]*/g, ' ').split(' ');

            if ((cols.length > 3) && (cols[0].length !== 0) && (cols[3].length !== 0) && cols[3] !== '00:00:00:00:00:00') {
                devices.push( new Device(cols[0], cols[3]) );
            }
        });
        console.log("end");
    }
    this.devices = devices;
  }

  printDevice() {
    var ret = '';
    this.devices.forEach(function(device) {
        ret += '<tr><td></td><td>' + device.getIp() + '</td><td>' + device.getMac() + '</td><td></td><td></td></tr>';
    });
    return ret;
  }

  resetDevices() {
    this.devices = [];
  }

  actaliation() {}
}
