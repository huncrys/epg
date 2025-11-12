# syntax=docker/dockerfile:1

FROM node:24-alpine@sha256:7c6062b1e87d60b84dd19fca8d48513430a65aae4e2ec12b98e54ee47ad031fe AS base

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
