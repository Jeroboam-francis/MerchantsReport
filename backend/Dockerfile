FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./package.json
RUN npm install --omit=dev
COPY backend/src ./src
EXPOSE 4000
USER node
CMD ["node", "src/server.js"]
