FROM node:16

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./ 
RUN apt-get update && apt-get install -y build-essential python
RUN npm install
COPY . .
RUN npm run build
EXPOSE 80

CMD ["npm","run","start:server"]
