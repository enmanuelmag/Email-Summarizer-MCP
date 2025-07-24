FROM node:22-slim

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile --prod

COPY . .

RUN pnpm run build

CMD [ "node", "dist/main.js" ]
