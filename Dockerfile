FROM node:22-slim

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
# COPY pnpm-lock.yaml ./

# RUN npm install -g pnpm

RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "dist/main.js" ]
