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
ENV VERSION=1.6.10
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml .pnp* package.json yarn.lock ./
RUN yarn workspaces focus --production
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --network-timeout 100000 && yarn cache clean
RUN wget https://github.com/JetBrains/kotlin/releases/download/v${VERSION}/kotlin-compiler-${VERSION}.zip && \
    unzip kotlin-compiler-${VERSION}.zip && \
    rm kotlin-compiler-${VERSION}.zip
COPY --from=builder /app/dist ./


FROM node:16-alpine3.14 AS runner
RUN addgroup -S devtool && adduser -S devtool -G devtool
RUN apk add -U --no-cache openjdk16 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community && \
    apk add -U --no-cache python3 && \
    apk del --purge --no-cache apk-tools wget
RUN rm -rf /sbin/reboot
WORKDIR /app
COPY --from=production /app ./
ENV PATH $PATH:/app/kotlinc/bin
USER devtool
CMD ["yarn", "node", "index.js"]
