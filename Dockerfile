# FROM node:16

# WORKDIR /usr/src/app

# COPY package.json ./
# COPY package-lock.json ./ 
# RUN apt-get update && apt-get install -y build-essential python
# RUN npm install
# COPY . .
# RUN npm run build
# EXPOSE 80

# CMD ["npm","run","start:server"]

#----------------------------------------------------------------
FROM node:20

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
RUN rm -rf node_modules package-lock.json
# RUN npm cache clean --force && npm install --production --build-from-source
RUN npm install --production --build-from-source
RUN npm install bcrypt@5.1.0 --production --build-from-source
COPY . .
EXPOSE 3000
RUN npm run build
# RUN npm start