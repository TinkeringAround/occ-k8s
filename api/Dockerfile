FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package file
COPY package*.json ./

# Install modules
RUN npm install --production

# Copy source code
COPY . .

# Replace Dev ENV with Prod ENV
RUN rm .env && mv prod.env .env

# Expose Port 3333
EXPOSE 3333

# Start server
CMD [ "node" , "server.js" ]