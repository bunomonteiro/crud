FROM node:18.16.1-alpine
ENV PORT=3000
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE ${PORT}
CMD ["node", "./src/main.js"]