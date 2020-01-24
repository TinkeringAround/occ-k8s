FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package file
COPY package*.json ./

# Install modules
RUN npm install --production

# Copy source code
COPY . .

# Start server
CMD [ "node" , "server.js" ]