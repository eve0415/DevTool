FROM node:lts-bullseye-slim AS base
RUN apt-get update && \
    apt-get dist-upgrade -y && \
    apt-get install -y --no-install-recommends wget ca-certificates python3


FROM base AS builder-base
RUN apt-get install -y --no-install-recommends unzip g++ make


FROM builder-base AS builder
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn install --immutable --network-timeout 100000
COPY . .
RUN chmod +x build.js
RUN yarn node build.js


FROM builder-base AS production
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml .pnp* package.json yarn.lock ./
RUN yarn workspaces focus --production
COPY --from=builder /app/out ./


FROM builder-base AS binary
ENV VERSION=1.8.0
WORKDIR /app
RUN wget -O kotlin.zip https://github.com/JetBrains/kotlin/releases/download/v${VERSION}/kotlin-compiler-${VERSION}.zip
RUN unzip kotlin.zip
RUN mv kotlinc/bin/*.bat kotlinc


FROM base AS runner
RUN groupadd -r devtool && useradd --no-log-init -r -g devtool devtool
WORKDIR /app
RUN mkdir -p /etc/apt/keyrings
COPY mono.pgp /etc/apt/keyrings/
RUN apt-get install -y --no-install-recommends gnupg dirmngr
RUN wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc && \
    echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list && \
    apt-key add /etc/apt/keyrings/mono.pgp && \
    echo "deb https://download.mono-project.com/repo/debian stable-buster main" | tee /etc/apt/sources.list.d/mono-official-stable.list
RUN apt-get update && \
    apt-get install -y --no-install-recommends temurin-17-jdk mono-devel python3 && \
    apt-get purge --auto-remove -y --allow-remove-essential wget gnupg dirmngr apt && \
    rm -rf /var/lib/apt/lists/* /etc/apt/keyrings /sbin/reboot
COPY --from=binary /app/kotlinc/bin/* /usr/local/bin
COPY --from=production /app ./
USER devtool
CMD ["yarn", "node", "--enable-source-maps", "index.js"]
