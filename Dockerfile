# DEVELOPMENT
FROM node:14-alpine AS development

WORKDIR /inzynierka/backend/src/app
COPY . .

RUN npm ci
RUN npx nest build

EXPOSE 3000

# PROD
FROM node:14 AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY --from=development /inzynierka/backend/src/app/ .

EXPOSE 8080

CMD ["node", "dist/main"]