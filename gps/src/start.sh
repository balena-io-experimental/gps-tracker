# mount the hostOS /dev with a devtmps on /host-dev in the container
# This allows new devices added to /dev to be mapped into the container.
mkdir /host-dev
mount -t devtmpfs none /host-dev

# Start our main node process
node src/main.js