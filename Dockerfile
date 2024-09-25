FROM node:20

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
RUN rm -rf node_modules package-lock.json
RUN npm install --production --build-from-source
RUN npm install bcrypt@5.1.0 --production --build-from-source
COPY . .
RUN npm run build
# EXPOSE 80

# CMD ["npm","run","start:server"]