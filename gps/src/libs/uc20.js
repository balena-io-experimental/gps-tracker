// Quectel uc20 modem

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

    this.enableGPS = function () {
        return _sendAtCommand('AT+QGPS=1');
    }

    this.disableGPS = function () {
        return _sendAtCommand('AT+QGPSEND');
    }
}

module.exports = UC20;