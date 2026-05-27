FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
RUN node db/seed.js
CMD ["node", "server.js"]