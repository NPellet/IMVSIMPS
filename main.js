const electron = require('electron')
const ipcMain = electron.ipcMain;

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const startTime = Date.now();

let voltages = [];
let currents = [];

// Handling serial port
const serial = require('serialport');
let port = new serial("/dev/cu.usbmodem1411", {
  baudrate: 115200
});


let incomingData = "";
port.on( "data", ( d ) => {

    let data2;
    incomingData = incomingData || "";
    incomingData += d.toString('ascii');

    while( incomingData.indexOf(";") > -1 ) {

      data2 = incomingData
        .substr( 0, incomingData.indexOf(";") + 1 );

      treatIncomingData( data2 );
      incomingData = incomingData.substr( incomingData.indexOf(";") + 1);
    }

    
});


var regexVoltage = /.*Voltage:([0-9.-]*);/;
var regexCurrent = /.*Current:([0-9.-]*);/;

function treatIncomingData( data ) {

  let time = ( Date.now() - startTime ) / 1000;
  
  if( regexVoltage.test( data ) ) {

    var results = regexVoltage.exec( data );

    voltages.push( [ time, results[ 1 ] / 1000 ] );

  } else if( regexCurrent.test( data ) ) {

    var results = regexCurrent.exec( data );

    currents.push( [ time, results[ 1 ] / 1000000 ] );
  }
}

ipcMain.on("port", (event, arg ) => {

  port = new serial("/dev/cu.usbmodem1411", {
    baudrate: 115200
  });

});

ipcMain.on("getState", ( event, arg ) => {

  event.sender.send("state", [ currents, voltages ]);
  currents = [];
  voltages = [];
});

ipcMain.on("setGalv", ( event, arg ) => {
  //port.once("open", function() {
    port.write("MODE:GALVANOSTAT;")
  //});
});

ipcMain.on("setPote", ( event, arg ) => {
  //port.once("open", function() {
    port.write("MODE:POTENTIOSTAT;")
  //});
});

ipcMain.on("current", ( event, arg ) => {

  //port.once("open", () => {
    console.log( "FORCE:CURRENT " + arg + ";" );
    port.write("FORCE:CURRENT " + arg + ";")
  //});
});


ipcMain.on("voltage", ( event, arg ) => {

  //port.once("open", () => {
    console.log( "FORCE:VOLTAGE " + arg + ";" );
    port.write("FORCE:VOLTAGE " + arg + ";")
  //});
});





// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
