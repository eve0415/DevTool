FROM node:lts-bullseye-slim AS base
RUN mkdir -p /etc/apt/apt.conf.d && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=private --mount=type=cache,target=/var/lib/apt,sharing=private \
  apt-get update && \
  apt-get dist-upgrade -y && \
  apt-get install -y --no-install-recommends ca-certificates python3 wget gnupg dirmngr


FROM base AS builder-base
RUN --mount=type=cache,target=/var/cache/apt,sharing=private --mount=type=cache,target=/var/lib/apt,sharing=private \
  apt-get install -y --no-install-recommends unzip g++ make curl


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


FROM builder-base AS kotlin
ENV VERSION=1.8.0
WORKDIR /app
RUN wget -O kotlin.zip https://github.com/JetBrains/kotlin/releases/download/v${VERSION}/kotlin-compiler-${VERSION}.zip
RUN unzip kotlin.zip
RUN rm kotlinc/bin/*.bat


FROM builder-base AS deno
RUN curl -s https://gist.githubusercontent.com/LukeChannings/09d53f5c364391042186518c8598b85e/raw/ac8cd8c675b985edd4b3e16df63ffef14d1f0e24/deno_install.sh | sh


FROM base AS runner
RUN groupadd -r devtool && useradd --no-log-init -r -g devtool devtool
WORKDIR /app
RUN mkdir -p /etc/apt/keyrings
COPY mono.gpg /etc/apt/keyrings/
RUN wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc && \
  echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list && \
  apt-key add /etc/apt/keyrings/mono.gpg && \
  echo "deb https://download.mono-project.com/repo/debian stable-buster main" | tee /etc/apt/sources.list.d/mono-official-stable.list
RUN --mount=type=cache,target=/var/cache/apt,sharing=private --mount=type=cache,target=/var/lib/apt,sharing=private \
  apt-get update && \
  apt-get install -y --no-install-recommends temurin-17-jdk mono-devel python3 && \
  apt-get purge --auto-remove -y --allow-remove-essential wget gnupg dirmngr apt && \
  rm -rf /var/lib/apt/lists/* /etc/apt/keyrings /sbin/reboot
COPY --from=kotlin /app/kotlinc/bin/* /usr/bin
COPY --from=kotlin /app/kotlinc/lib /usr/lib
COPY --from=deno /root/.deno/bin/deno /usr/bin
COPY --from=production /app ./
USER devtool
CMD ["yarn", "node", "--enable-source-maps", "index.js"]
