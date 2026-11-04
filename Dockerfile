# syntax=docker/dockerfile:1
#
# MyAnki static site image. The build stage runs on the build host (the output
# is static files); the final image targets Fargate X86_64:
#   docker build --platform linux/amd64 -t myanki:<tag> .

FROM --platform=$BUILDPLATFORM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03
USER root
# The stock server block is replaced by docker/nginx.conf.
RUN rm -f /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*
COPY docker/nginx.conf /etc/nginx/nginx.conf
# Owned by root, so the nginx user can read but not modify the site.
COPY --from=build /app/dist /usr/share/nginx/html
USER 101:101
EXPOSE 8080
# The only writable path when the root filesystem is read-only. On Fargate the
# task definition mounts a volume at the same path.
VOLUME ["/tmp"]
