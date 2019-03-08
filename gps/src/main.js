const Quectel = require("./libs/quectel.js");
const led = require("./libs/leds.js");
const dbus = require('dbus-native');
const bus = dbus.sessionBus({socket: '/host/run/dbus/system_bus_socket'});
led.reset();
var prev = {lat: null, lon: null};
const modem = new Quectel(bus);
// Start GPS with rate of 1 seconds
modem.enableGPS(1)
    .then(result => console.log(result))
    .catch((err) => {
      console.log("Error enabling GPS: ", err);
      // Try disabling GPS as this often helps
      modem.disableGPS()
          .then(result => console.log("GPS disabled"))
          .catch((err) => {
            console.log("Error disabling GPS: ", err);
            process.exit(1);
          });
      process.exit(1);
    });
    
const BalenaSdk = require('balena-sdk');
var sdk;
sdk = BalenaSdk();
sdk.auth.logout();
sdk.auth.loginWithToken(process.env.BALENA_API_KEY);

const SerialPort = require('serialport');
const parsers = SerialPort.parsers;
const parser = new parsers.Readline({
  delimiter: '\r\n'
});
// Setting up the GPS device, defaulting to EC25 as set up in the udev rules in this project
const gpsdev = process.argv[2] || 'EC25.NMEA'
const gpsPort = new SerialPort(`/dev/${gpsdev}`, {
  baudRate: 9600
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
});

gpsPort.pipe(parser);
 
var GPS = require('gps');
var gps = new GPS;

var setLocation = function() {
  if (sdk && gps.state.lat != null) {
    console.log("Setting API Location -- Lat : ", gps.state.lat, " Lon : ", gps.state.lon);
    sdk.models.device.setCustomLocation(process.env.BALENA_DEVICE_UUID, { latitude: gps.state.lat, longitude: gps.state.lon })
      .catch(function(e) {
        console.error('Error while setting customLocation', e);
      });
  }
}

// Update location ever 10 minutes
let timerId = setInterval(() => setLocation(), 600000);

gpsPort.on('data', function(data) {
  try {
    gps.updatePartial(data);
  } catch(err) {
    console.error(err)
  }
});

gps.on('data', function(){
  if (gps.state.fix == null) {
    led.color("red");
  } else {
    led.color("green");
  }

});

process.on( "SIGTERM", function() {
  console.log('CLOSING [SIGINT]');
  modem.disableGPS()
    .then(result => console.log("GPS disabled"))
    .catch((err) => {
      console.log("Error disabling GPS: ", err);
      process.exit(1);
    });
  process.exit();
} );
