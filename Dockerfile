FROM node:18

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN chmod +x wait-for-db.sh

EXPOSE 3000

CMD ["./wait-for-db.sh", "node", "dist/index.js"]
