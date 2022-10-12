FROM node

# WORKDIR /d

COPY . .

RUN npm install

EXPOSE 7777

CMD [ "node", "index.js" ]
# RUN npm start


