const electron = require('electron')


// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
let mainWindow = null

const path = require('path')
const url = require('url')

const logger = require('electron-log')
logger.transports.file.file = __dirname + '/log.txt';

function createWindow ()
{

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1400, height: 1000, icon: __dirname + '/media/brand-small.png'})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({ pathname: path.join(__dirname, 'app/index.html'), protocol: 'file:', slashes: true }))

  mainWindow.on('closed', function () {

    mainWindow = null
  })
}


app.on('ready', createWindow)

app.on('window-all-closed', function ()
{
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function ()
{
  if (mainWindow === null) {
    createWindow()
  }
})
