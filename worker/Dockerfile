FROM node:10-slim

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy package file
COPY package*.json ./

# Install modules
RUN npm install --production

# Copy source code
COPY . .

# Replace Dev ENV with Prod ENV
RUN rm .env && mv prod.env .env

# Expose Port 3500
EXPOSE 3500

CMD ["google-chrome-unstable"]