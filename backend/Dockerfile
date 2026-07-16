FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# 개발 모드로 실행 (package.json에 dev 스크립트가 있어야 합니다)
CMD ["npm", "run", "dev"]