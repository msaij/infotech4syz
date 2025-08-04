# docker file for frontend

FROM node:18

COPY ./frontend ./frontend

# set working directory
WORKDIR /frontend

# install dependencies and build the project
RUN npm install
RUN npm run build