var fs = require('fs');

function print(array){
  var ret = "";
  for (var i = 0; i < array.length; i++) {
    ret += "<tr><td></td><td>" + array[i].ip + "</td><td>" + array[i].mac + "</td><td></td><td></td></tr>";
  }
  return ret;
}
var output = [];

if (process.platform === 'win32'){
  const { exec } = require('child_process');
  exec('arp -a', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
    var devices = stdout.toString().split('\n');
    var tableau = [];
    for (var i in devices){
      if (devices[i].indexOf("dynamique") != -1){
        var cols = devices[i].replace(/ [ ]*/g, ' ').split(' ');
          output.push({
            ip: cols[1],
            mac: cols[2]
          })
        }
      }
    document.getElementById("deviceTable").innerHTML = print(output);
  });
}
else {
  fs.readFile('/proc/net/arp', function(err, data) {
    if (!!err) return done(err, null);

    var tableau = [];
    var devices = data.toString().split('\n');
    devices.splice(0,1);

    for (i = 0; i < devices.length; i++) {
      var cols = devices[i].replace(/ [ ]*/g, ' ').split(' ');

      if ((cols.length > 3) && (cols[0].length !== 0) && (cols[3].length !== 0) && cols[3] !== '00:00:00:00:00:00') {
        output.push({
            ip: cols[0],
            mac: cols[3]
          });
        }
      }
      document.getElementById("deviceTable").innerHTML = print(output);
  });
}
console.log(output);
