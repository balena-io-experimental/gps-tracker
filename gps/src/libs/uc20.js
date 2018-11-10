// Quectel uc20 modem
// AT commands from https://www.quectel.com/UploadImage/Downlad/Quectel_UC20_GNSS_AT_Commands_Manual_V1.1.pdf
function UC20(bus){
    var _bus = bus;

    _sendAtCommand = function (cmd) {
        return new Promise(function(resolve, reject) {
            _bus.invoke({
                destination: 'org.freedesktop.ModemManager1',
                path: '/org/freedesktop/ModemManager1/Modem/0',
                interface: 'org.freedesktop.ModemManager1.Modem',
                member: 'Command',
                signature: 'su',
                body: [cmd,1]
            }, function(err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
        })
    }

    this.getHardwareRevision = function () {
        return _sendAtCommand('ATI');
    }

    this.enableGPS = function (period) {
        return _sendAtCommand('AT+QGPS=1,30,50,0,'+ period.toString());
    }

    this.enableOnlyGgaNmea = function () {
        return _sendAtCommand('AT+QGPSCFG="gpsnmeatype",1')
    }

    this.disableGPS = function () {
        return _sendAtCommand('AT+QGPSEND');
    }
}

module.exports = UC20;