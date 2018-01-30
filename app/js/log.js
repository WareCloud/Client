const remote = require('electron').remote
const main = remote.require('./main.js')

var button = document.getElementById('logbutton')
button.addEventListener('click', () => {
  //recupération des infos
  //call api, login
  window.location.href = './index2.html'
}, false)
