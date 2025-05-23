FROM node:20.5-bullseye as deps
WORKDIR /app
COPY package.json  yarn.lock /app/

RUN yarn install --immutable

FROM node:20.5-bullseye as builder
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . /app

# Hardcode the API and site URLs for the client
ENV NEXT_PUBLIC_API_BASEURL=https://apiklm.ueckoken.club
ENV NEXT_PUBLIC_SITE_BASEURL=https://klm.ueckoken.club
ENV NEXT_PUBLIC_DISCORD_CLIENT_ID=1228298207612764201
ENV NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://apiklm.ueckoken.club/discord-callback


RUN yarn build

FROM gcr.io/distroless/nodejs:18 AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder --chown=nonroot:nonroot /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
USER nonroot
CMD ["server.js"]
