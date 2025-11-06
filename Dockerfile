# syntax=docker/dockerfile:1

FROM node:24-alpine@sha256:f36fed0b2129a8492535e2853c64fbdbd2d29dc1219ee3217023ca48aebd3787 AS base

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
