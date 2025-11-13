# syntax=docker/dockerfile:1

FROM node:24-alpine@sha256:2867d550cf9d8bb50059a0fff528741f11a84d985c732e60e19e8e75c7239c43 AS base

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
