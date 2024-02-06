# pull the base image
FROM node:18.17.0 as base

# # set the working direction
WORKDIR /app
COPY . .

# install app dependencies
RUN yarn install && yarn cache clean

EXPOSE 6100

# start app
CMD ["yarn", "start"]

FROM base as builder

RUN yarn webpack build \
    --mode production \
    --optimization-concatenate-modules \
    --optimization-minimize \
    --output-clean \
    --output-path /dist/ && \
    npx react-inject-env set -d /dist/

FROM nginx:1.25.2 as final

# Copy built files
COPY .env /.env
COPY nginx_env_config.sh /docker-entrypoint.d/
RUN chmod 777 /docker-entrypoint.d/nginx_env_config.sh
COPY --from=builder /dist/* /usr/share/nginx/html/