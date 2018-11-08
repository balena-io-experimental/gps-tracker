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