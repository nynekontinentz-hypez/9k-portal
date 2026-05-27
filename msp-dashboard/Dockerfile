FROM node:20-alpine
WORKDIR /app
COPY api/package*.json ./
RUN npm install --production
COPY api/ ./api/
WORKDIR /app/api
RUN node seed.js
EXPOSE 3001
CMD ["node", "server.js"]