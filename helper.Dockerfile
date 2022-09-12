FROM node:lts-alpine AS base
RUN apk add python3 make g++ wget
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml package.json yarn.lock build.js tsconfig.json ./
RUN yarn install --immutable --network-timeout 100000
COPY helper ./
RUN chmod +x build.js
RUN yarn node build.js


FROM node:lts-alpine AS production
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml .pnp* package.json yarn.lock ./
COPY --from=base /app/out .


FROM node:lts-alpine AS runner
WORKDIR /app
COPY --from=production /app ./
CMD ["yarn", "node", "index.js", "--enable-source-maps"]
