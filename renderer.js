// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const jsGraph = require("node-jsgraph/dist/jsgraph-es6");
const {ipcRenderer} = require('electron')
const jQuery = require("jquery/dist/jquery.min");
const $ = jQuery;


   
let allCurrents = [];
let allVoltages = [];

ipcRenderer.on('state', (event, arg) => {


  let currents = arg[ 0 ];
  let voltages = arg[ 1 ];


  if( voltages.length == 0 || currents.length == 0 ) {
  	return;
  }
  
  allCurrents = allCurrents.concat( currents );
  allVoltages = allVoltages.concat( voltages );


  $("#lastVoltage").text( Math.round( voltages[ voltages.length - 1 ][ 1 ] * 1000 ) / 1000 );
  $("#lastCurrent").text( Math.round( currents[ currents.length - 1 ][ 1 ] * 1000000 ) / 1000 );
  voltageSerie.setData( allVoltages );
  currentSerie.setData( allCurrents );

  voltageGraph.autoscaleAxes();
  currentGraph.autoscaleAxes();
  voltageGraph.draw();
  currentGraph.draw();
});


setInterval( function() {
	ipcRenderer.send("getState");
}, 1000 );

var voltageGraph = new jsGraph("voltage");
voltageGraph.resize(600, 200);
voltageGraph.getLeftAxis().setUnit("V").setEngineering( true ).setUnitDecade( true );
var voltageSerie = voltageGraph.newSerie("voltage").autoAxis();


var currentGraph = new jsGraph("current");
currentGraph.resize(600, 200);
currentGraph.getLeftAxis().setUnit("A").setEngineering( true ).setUnitDecade( true );
var currentSerie = currentGraph.newSerie("current").autoAxis();


$( document ).ready( function() {

	$("#update").on('click', function() {

		var formResult = $("#form").serializeArray().map( ( {name, value} ) => {

			if( name == "port" ) {
				if( value !== "" ) {
					ipcRenderer.send( "port", value );
				}
			}

			if( name == "mode" ) {
				if( value == "potentiostat") {	
					ipcRenderer.send("setPote");
				} else if( value == "galvanostat" ) {
					ipcRenderer.send("setGalv");
				}
			}

			if( name == "voltage" ) {
				ipcRenderer.send("voltage", value );
			}

			if (name == "current" ) {
				ipcRenderer.send("current", value );
			}
		});
	});

})