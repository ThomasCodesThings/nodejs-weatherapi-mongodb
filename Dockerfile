FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm update && npm install

COPY . .

ENV PORT=3456
ENV API_KEY=a8c2193d97a37b43d223524a3bbc717d
ENV API_URL=https://api.openweathermap.org/data/2.5/weather

EXPOSE 3456

CMD ["npm", "start"]
