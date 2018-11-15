# GPS Tracker
GPS Tracker is a simple asset tracker built on balenaCloud and the balena fin board. It makes use of a Quectel EC25 modem to provide both cellular connectivity and GPS location services. The application is a simple node.js service that reads GPS NMEA sentences from the modems serial port and then updates the balena API every 10 minutes with the devices' location. The device location can then be seen from the balenaCloud dashboard.

## What you need:
- [Balena Fin board](https://store.balena.io/)
- [Quectel UC20 pcie modem](https://www.quectel.com/product/uc20minipcIe.htm) with 3G and GPS antenna
- [A balenaCloud account](https://www.balena.io/cloud/)
- [A hologram account and sim card](https://hologram.io/)

![Hardware needed](https://raw.githubusercontent.com/balena-io-playground/gps-tracker/master/gps/fin-gps.jpg)

## Setup:
### Preparing the image:
1. Download a 2.26.0 or later .prod variant of the fin operating system from your newly created application
2. Unzip the image and mount the boot partition.
3. Add the following hologram connection file to `resin-boot/system-connections` folder so that our cellular connection will work on first boot.

```
[connection]
id=hologram-connection
type=gsm
autoconnect=true

[gsm]
apn=hologram
number=*99#

[serial]
baud=115200

[ipv4]
method=auto

[ipv6]
addr-gen-mode=stable-privacy
method=ignore
```

4. Include your public SSH key into the config.json so that we can use the hologram spaceBridge to ssh into our device even when the balenaCloud VPN is turned off. This can be done by adding the following to your config.json on the resin-boot partition, where KEY1 is replaced by the string from your ~/.ssh/id_rsa.pub . For more info on setting these values see here: https://github.com/balena-os/meta-balena#os
```json
"os": {
    "sshKeys": [
      "KEY1"
    ]
  }
```

5. Add a custom udev rule into the hostOS so that our modem is always enumerated to the same device name, which makes it easy to read our GPS stream. In this case we add a rule to our config.json to always map our modems GPS serial port to `/dev/EC25.NMEA`. For more info on setting these values see here: https://github.com/balena-os/meta-balena#os . To do this we add the following to the “os” section of the config.json:
```json
       "udevRules": {
           "20-quectel": "SUBSYSTEMS==\"usb\", ENV{.LOCAL_ifNum}=\"$attr{bInterfaceNumber}\"\n\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"05c6\", ATTRS{idProduct}==\"9003\", ENV{.LOCAL_ifNum}==\"01\", SYMLINK+=\"UC20.NMEA\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"05c6\", ATTRS{idProduct}==\"9003\", ENV{.LOCAL_ifNum}==\"02\", SYMLINK+=\"UC20.AT\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"05c6\", ATTRS{idProduct}==\"9003\", ENV{.LOCAL_ifNum}==\"03\", SYMLINK+=\"UC20.MODEM\", MODE=\"0660\"\n\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0121\", ENV{.LOCAL_ifNum}==\"02\", SYMLINK+=\"EC21.AT\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0121\", ENV{.LOCAL_ifNum}==\"03\", SYMLINK+=\"EC21.MODEM\", MODE=\"0660\"\n\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0125\", ENV{.LOCAL_ifNum}==\"01\", SYMLINK+=\"EC25.NMEA\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0125\", ENV{.LOCAL_ifNum}==\"02\", SYMLINK+=\"EC25.AT\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0125\", ENV{.LOCAL_ifNum}==\"03\", SYMLINK+=\"EC25.MODEM\", MODE=\"0660\"\n\n"
       }

```

6. At the end our complete config.json should look something like the following:
```json
{
   "applicationName": "GPS-tracker",
   "applicationId": 3333390,
   "deviceType": "fincm3",
   "userId": 8888,
   "username": "john_doe",
   "appUpdatePollInterval": 600000,
   "listenPort": 48484,
   "vpnPort": 443,
   "apiEndpoint": "https://api.balena-cloud.com",
   "vpnEndpoint": "vpn.balena-cloud.com",
   "registryEndpoint": "registry2.balena-cloud.com",
   "deltaEndpoint": "https://delta.balena-cloud.com",
   "pubnubSubscribeKey": "sub-c-aaaaaaaaaaaaaaaaaaaaa",
   "pubnubPublishKey": "pub-c-bbbbbbbbbbbbbbbbbbbbbbb",
   "mixpanelToken": "ccccccccccccccccccccccc",
   "apiKey": "deadbeefffffffffffff",
   "os": {
       "sshKeys": [
           "ssh-rsa blablablablabla johndoe@balena.io"
       ],
       "udevRules": {
           "20-quectel": "SUBSYSTEMS==\"usb\", ENV{.LOCAL_ifNum}=\"$attr{bInterfaceNumber}\"\n\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"05c6\", ATTRS{idProduct}==\"9003\", ENV{.LOCAL_ifNum}==\"01\", SYMLINK+=\"UC20.NMEA\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"05c6\", ATTRS{idProduct}==\"9003\", ENV{.LOCAL_ifNum}==\"02\", SYMLINK+=\"UC20.AT\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"05c6\", ATTRS{idProduct}==\"9003\", ENV{.LOCAL_ifNum}==\"03\", SYMLINK+=\"UC20.MODEM\", MODE=\"0660\"\n\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0121\", ENV{.LOCAL_ifNum}==\"02\", SYMLINK+=\"EC21.AT\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0121\", ENV{.LOCAL_ifNum}==\"03\", SYMLINK+=\"EC21.MODEM\", MODE=\"0660\"\n\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0125\", ENV{.LOCAL_ifNum}==\"01\", SYMLINK+=\"EC25.NMEA\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0125\", ENV{.LOCAL_ifNum}==\"02\", SYMLINK+=\"EC25.AT\", MODE=\"0660\"\nSUBSYSTEMS==\"usb\", KERNEL==\"ttyUSB[0-9]*\", ATTRS{idVendor}==\"2c7c\", ATTRS{idProduct}==\"0125\", ENV{.LOCAL_ifNum}==\"03\", SYMLINK+=\"EC25.MODEM\", MODE=\"0660\"\n\n"
       }
   }
}

```

### Configuring the App for minimal bandwidth usage

If your devices are primarily running on cellular data, you should disable the following settings on your "Fleet Configuration" dashboard:
- Disable VPN connectivity check
- Disable logs from being sent to Resin
- Disable VPN
- Set `BALENA_SUPERVISOR_POLL_INTERVAL` == `86400000`, this ensures that the supervisor only checks infor updates once ever 24 hours.

Note that disabling all of the above will mean that you no longer get lively status feedback of your device, for example the online/offline indicator will always show offline and you will not get logs pushed back to the dashboard. With all of the above settings the regular operation of the device should use less than 2MB per month. For more information on bandwidth saving checkout this blog post on [Device Data Usage](https://www.balena.io/blog/device-bandwidthdata-usage-how-low-can-we-go/). 

With the device posting to the API every 10 minutes and the minimal daily check ins for the balena update infrastructure, the device uses about 3MB per day. The underlying balena check-in will only use about 100kiB per day, so roughly 3MB/month.

Additionally to reduce the size and impact off your updates you should set the following two device configuration options:
- `BALENA_SUPERVISOR_DELTA` == `1`
- `BALENA_SUPERVISOR_DELTA_VERSION` == `3`

### Using hologram SpaceBridge

The hologram service provides a tool called [spaceBridge](https://hologram.io/docs/guide/cloud/spacebridge-tunnel/) which allows one to securely ssh into devices though the hologram network. Since balenaOS devices run a socket activated SSH deamon on port 22222, and we have added our custom SSH key in step 4 of "Preparing the image", we can simply set up spaceBridge following the [hologram spaceBridge guide](https://hologram.io/docs/guide/cloud/spacebridge-tunnel/). Now if we setup spaceBridge to create a link between our device's port 22222 and our laptop's port 3000. We now should have a secure SSH tunnel into the host of our balenaOS device even with the balena VPN disabled! 

Once you have the spaceBridge running open a terminal session on your laptop and run the following to ssh into your device remotely, make sure you have your key added in step 4 added into your ssh-agent:
```
ssh root@127.0.0.1 -p3000
```

__Note:__ That spaceBridge will only work when there is an active data session on the cellular connection, so when your device is running on wifi, spaceBridge will fail to establish a link.

### GPS Related Testing Info

Quectel EC25:

enable GPS:
mmcli -m 0 --command='AT+QGPS=1'

read GPS
mmcli -m 0 --command='AT+QGPSGNMEA="GGA"'

end GPS session:
mmcli -m 0 --command='AT+QGPSEND'

```
DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket \
dbus-send --print-reply --system \
     --dest=org.freedesktop.ModemManager1 \
     /org/freedesktop/ModemManager1/Modem/0 \
     org.freedesktop.ModemManager1.Modem.Command \
  string:"AT+QGPSEND" \
  uint32:100

``` 
# List all modems

```
DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket \
dbus-send --system --print-reply \
 --dest=org.freedesktop.ModemManager1 /org/freedesktop/ModemManager1 \
 org.freedesktop.DBus.ObjectManager.GetManagedObjects
```

DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket \
dbus-send --print-reply --system \
     --dest=org.freedesktop.ModemManager1 \
     /org/freedesktop/ModemManager1/Modem/0 \
     org.freedesktop.ModemManager1.Modem.Reset
