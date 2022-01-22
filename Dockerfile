# DEVELOPMENT
FROM node:14-alpine AS development

RUN apk --no-cache --virtual build-dependencies add \
    python3 \
    make \
    g++ \
    && npm install \
    && apk del build-dependencies


RUN apk add musl-dev
RUN npm install -g node-gyp
RUN npm install --only=development

RUN mkdir -p /inzynierka/backend/src/app
WORKDIR /inzynierka/backend/src/app

COPY package*.json /inzynierka/backend/src/app

RUN npm ci
RUN npm rebuild

COPY . /inzynierka/backend/src/app

RUN npm run build

EXPOSE 3000

# PROD
FROM node:14 AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /inzynierka/backend/src/app

COPY --from=development /inzynierka/backend/src/app/ .

EXPOSE 3000

RUN npm run clean
RUN sh setup.sh
# CMD ["npm", "run", "seed"]
CMD ["npm", "run", "start:prod"]