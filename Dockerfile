FROM node:16.13.1


# Install nodemon
RUN npm install -g nodemon concurrently
#concurrently will let us run bankend express server
#and frontend react developement sevver at the same time
#by giving a single command


# Create app directory
RUN mkdir - p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm install 
EXPOSE 80
CMD ["npm", "start"]