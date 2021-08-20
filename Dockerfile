FROM node:16-alpine3.14 AS builder-base
RUN apk add python3 make g++


FROM builder-base AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 100000 && yarn cache clean
COPY . .
RUN yarn build


FROM builder-base AS production
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --network-timeout 100000 && yarn cache clean
COPY --from=builder /app/dist ./


FROM node:16-alpine3.14 AS runner
RUN apk add -U --no-cache python3 && apk --purge del apk-tools
RUN rm -rf /usr/bin/wget
RUN addgroup -S devtool && adduser -S devtool -G devtool
USER devtool
WORKDIR /app
COPY --from=production /app ./
CMD ["node", "index.js"]
