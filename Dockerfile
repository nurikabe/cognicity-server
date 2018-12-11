FROM node:9 AS build
WORKDIR /opt/app
ADD package.json .
RUN npm install

FROM node:9-slim
WORKDIR /opt/app
COPY --from=build /opt/app .
ADD . .
EXPOSE 4200
ENTRYPOINT [ "npm", "run", "dev" ]
