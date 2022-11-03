FROM node

COPY . .

RUN npm install

EXPOSE 7777

CMD [ "node", "index.js" ]


