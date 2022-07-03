FROM node:16-alpine AS builder-base
RUN apk add python3 make g++ wget

FROM builder-base AS builder
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn install --immutable --network-timeout 100000
COPY . .
RUN chmod +x build.js
RUN yarn node build.js


FROM builder-base AS production
ENV VERSION=1.7.0
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml .pnp* package.json yarn.lock ./
RUN yarn workspaces focus --production
RUN wget https://github.com/JetBrains/kotlin/releases/download/v${VERSION}/kotlin-compiler-${VERSION}.zip --inet4-only && \
    unzip kotlin-compiler-${VERSION}.zip && \
    rm kotlin-compiler-${VERSION}.zip
COPY --from=builder /app/out ./


FROM node:16-alpine AS runner
RUN addgroup -S devtool && adduser -S devtool -G devtool
RUN apk add -U --no-cache openjdk16 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community && \
    apk add -U --no-cache python3 bash && \
    apk del --purge --no-cache apk-tools wget
RUN rm -rf /sbin/reboot
WORKDIR /app
COPY --from=production /app ./
ENV PATH $PATH:/app/kotlinc/bin
USER devtool
CMD ["yarn", "node", "index.js"]
