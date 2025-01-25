FROM node:22.13.1-alpine AS base

FROM base AS builder

COPY . /app

WORKDIR /app

RUN npm ci

FROM base

COPY --from=builder /app /app

WORKDIR /app

ENV NPM_CONFIG_LOGLEVEL=silent

RUN apk --no-cache --update add \
        bash \
        curl \
        nginx \
        nginx-mod-http-fancyindex \
        tzdata

COPY ./nginx.default.conf /etc/nginx/http.d/default.conf

CMD ["nginx", "-g", "daemon off;"]

EXPOSE 9980
VOLUME /app/guides
