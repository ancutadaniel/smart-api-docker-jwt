FROM node:8.17.0

WORKDIR /smart-brain-api

COPY ./ ./

RUN npm install

CMD [ "/bin/bash", "nodemon", "--exec", "npm", "run", "docker-start" ]