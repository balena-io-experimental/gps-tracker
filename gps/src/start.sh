#!/bin/bash

# Select what device to use
GPSDEV=""
if [ -n "${GPS}" ]; then
  # If a specific device is provided theough env vars, use that
  GPSDEV="${GPS}"
  echo "Using explicitly provided GPS device: /dev/${GPSDEV}"
else
  # If no specific device is provided, try to auto-detect
  SUPPORTED=(EC25.NMEA EC20.NMEA UC20.NMEA)
  for dev in "${SUPPORTED[@]}"; do
    if [ -c "/dev/${dev}" ]; then
      GPSDEV="${dev}"
      echo "Using autodetected GPS device: /dev/${GPSDEV}"
      break
    fi
  done
fi

# Start our main node process
while : ; do
  node src/main.js "${GPSDEV}"
  echo "Sleeping before restarting exited service"
  sleep 10
done
