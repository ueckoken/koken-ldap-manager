FROM node:20.4-bullseye as deps
WORKDIR /app
COPY package.json  yarn.lock /app/

RUN yarn install --immutable

FROM node:20.4-bullseye as builder
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . /app

RUN yarn build

FROM gcr.io/distroless/nodejs:18 AS runner

COPY --from=builder --chown=nonroot:nonroot /app/build ./
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules

EXPOSE 3000

ENV PORT 3000
USER nonroot
CMD ["app.js"]
