# Stage 1: Dependencies
FROM node:23-alpine:slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD npm run dev
