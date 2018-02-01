var fs = require('fs');

function print(array){
  var ret = "<table><tr><td>IP ADRESSE</td><td>MAC ADRESSE</td></tr>";
  for (var i = 0; i < array.length; i++) {
    ret += "<tr><td>" + array[i].ip + "</td><td>" + array[i].mac + "</td></tr>";
  }
  ret += "</table>";
  return ret;
}

fs.readFile('/proc/net/arp', function(err, data) {
  if (!!err) return done(err, null);

  var output = [];
  var tableau = [];
  var devices = data.toString().split('\n');
  devices.splice(0,1);

  for (i = 0; i < devices.length; i++) {
    var cols = devices[i].replace(/ [ ]*/g, ' ').split(' ');

    if ((cols.length > 3) && (cols[0].length !== 0) && (cols[3].length !== 0) && cols[3] !== '00:00:00:00:00:00') {
      if (tableau.lenght == 0)
        tableau.push(cols[0]);
      else
        tableau.push("<br />" + cols[0]);
      output.push({
          ip: cols[0],
          mac: cols[3]
        });
      }
    }

  console.log(output);
  document.getElementById("mondiv").innerHTML = print(output);
});
