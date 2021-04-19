FROM node:current-alpine AS builder-base
RUN apk add --no-cache python3 make g++ git

FROM builder-base AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM builder-base AS runner
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production && yarn cache clean
COPY --from=builder /app/dist ./
CMD ["node", "index.js"]
