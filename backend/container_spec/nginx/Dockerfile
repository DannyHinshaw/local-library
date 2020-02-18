# Build the React app
FROM node:12.16.0 as build-deps
WORKDIR /usr/src/app
COPY /frontend/package.json /frontend/yarn.lock ./
RUN yarn
COPY /frontend ./
RUN yarn build

# Setup nginx server
FROM nginx:alpine
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
