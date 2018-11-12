# Use balenalib base images with udev disabled, this is a must as udev
# in the container causes issues for the host
FROM balenalib/fincm3-node:10-stretch-build-20181029 as build

# Install git to pull src for some npm packages
RUN install_packages git

COPY package.json package.json

RUN npm install

# Our runtime container with just the compiled node_modules copied over.
FROM balenalib/fincm3-node:10-stretch-run-20181029

COPY --from=build ./node_modules ./node_modules

COPY . .

CMD ["bash", "src/start.sh"]