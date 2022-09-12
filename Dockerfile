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
ENV VERSION=1.7.10
WORKDIR /app
COPY .yarn/ ./.yarn
COPY .yarnrc.yml .pnp* package.json yarn.lock ./
RUN yarn workspaces focus --production
RUN wget https://github.com/JetBrains/kotlin/releases/download/v${VERSION}/kotlin-compiler-${VERSION}.zip && \
    unzip kotlin-compiler-${VERSION}.zip && \
    rm kotlin-compiler-${VERSION}.zip
COPY --from=builder /app/out ./


FROM base AS runner
RUN groupadd -r devtool && useradd --no-log-init -r -g devtool devtool
RUN mkdir -p /etc/apt/keyrings && \
    apt-get install -y --no-install-recommends gnupg dirmngr && \
    wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc && \
    echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list && \
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF && \
    echo "deb https://download.mono-project.com/repo/debian stable-buster main" | tee /etc/apt/sources.list.d/mono-official-stable.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends temurin-17-jdk mono-devel python3 && \
    apt-get purge --auto-remove -y --allow-remove-essential wget gnupg dirmngr apt && \
    rm -rf /var/lib/apt/lists/* /etc/apt/keyrings /sbin/reboot
WORKDIR /app
COPY --from=production /app ./
ENV PATH $PATH:/app/kotlinc/bin
USER devtool
CMD ["yarn", "node", "--enable-source-maps", "index.js"]
