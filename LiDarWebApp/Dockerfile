# Nodejs Base image
FROM node:12.22.12 as build-stage
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Install and app dependencies
# RUN npm install -g npm@6.14.13
RUN npm update
COPY package.json /app/package.json
RUN npm install -g @angular/cli
RUN npm install

# Add app into the app folder
COPY . /app

# Run build command
RUN ng build --prod


FROM nginx:latest
COPY --from=build-stage /app/dist/LiDarWebApp/ /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

# Run app command
#CMD ng serve --host 0.0.0.0 --disableHostCheck
