FROM balenalib/fincm3-node:10-stretch-build-20181029 as build

RUN install_packages git

COPY package.json package.json

RUN npm install

FROM balenalib/fincm3-node:10-stretch-run-20181029

COPY --from=build ./node_modules ./node_modules

COPY . .

CMD ["bash", "src/start.sh"]