FROM node:12

WORKDIR /usr/app

COPY package.json .
RUN npm install --silent

COPY . .

CMD ["npm", "run", "watch", "|", "npm", "run", "bunyan", "-o", "simple"]
