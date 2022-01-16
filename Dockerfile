FROM node:16-alpine3.14 AS builder-base
RUN apk add python3 make g++


FROM builder-base AS builder
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn install --immutable --network-timeout 100000
COPY . .
RUN yarn build


FROM builder-base AS production
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml .pnp* package.json yarn.lock ./
RUN yarn workspaces focus --production
COPY --from=builder /app/dist ./


FROM node:16-alpine3.14 AS runner
RUN addgroup -S devtool && adduser -S devtool -G devtool
RUN apk add --no-cache openjdk16 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
RUN apk add -U --no-cache python3 && \
    apk --purge del apk-tools
RUN rm -rf /usr/bin/wget
WORKDIR /app
COPY --from=production /app ./
USER devtool
CMD ["yarn", "node", "index.js"]
