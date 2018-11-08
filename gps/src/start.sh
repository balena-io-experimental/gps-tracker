# Set the dbus path to communicate with hostOS dbus
export DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket

# Enable GPS engine
dbus-send --print-reply --system \
     --dest=org.freedesktop.ModemManager1 \
     /org/freedesktop/ModemManager1/Modem/0 \
     org.freedesktop.ModemManager1.Modem.Command \
  string:"AT+QGPS=1" \
  uint32:100

#Start our Node process
node src/main.js

