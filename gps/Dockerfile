FROM balenalib/fincm3-node:10-stretch-build-20181029 as build

RUN install_packages git

RUN npm install gps balena-sdk serialport

FROM balenalib/fincm3-node:10-stretch-run-20181029

COPY --from=build ./node_modules ./node_modules

RUN install_packages dbus

COPY . .

CMD ["bash", "src/start.sh"]