const Uc20 = require("./libs/uc20.js");
const dbus = require('dbus-native');
const bus = dbus.sessionBus({socket: '/host/run/dbus/system_bus_socket'});

const uc20 = new Uc20(bus);
uc20.enableGPS()
    .then(result => console.log(result))
    .catch((err) => {
      console.log("Error enabling GPS: ", err);
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
const gpsPort = new SerialPort('/dev/UC20.NMEA', {
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
  console.log("fix: ", gps.state.fix);
  console.log("Lat : ", gps.state.lat, " Lon : ", gps.state.lon);
  // Only set the device location on the API if we have a fix.
  if (sdk && gps.state.fix) {
    sdk.models.device.setCustomLocation(process.env.BALENA_DEVICE_UUID, { latitude: gps.state.lat, longitude: gps.state.lon })
      .catch(function(e) {
        console.error('Error while setting customLocation', e);
      });
  }
}

// Update location ever 1 minute
let timerId = setInterval(() => setLocation(), 60000);

gpsPort.on('data', function(data) {
  gps.updatePartial(data);
});

process.on( "SIGTERM", function() {
  console.log('CLOSING [SIGINT]');
  uc20.disableGPS()
    .then(result => console.log("GPS disabled"))
    .catch((err) => {
      console.log("Error disabling GPS: ", err);
      process.exit(1);
    });
  process.exit();
} );