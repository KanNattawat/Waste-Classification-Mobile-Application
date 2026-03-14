FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --production
RUN npx prisma generate
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]