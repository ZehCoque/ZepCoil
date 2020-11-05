const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");
const server = require("../../server/server")
const auth = require('../../server/models/auth');

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    show:false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `../../dist/zepcoil/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (auth.db_conn()){
      auth.db_conn().destroy();
    }

    app.quit();
  }
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
