# pull the base image
FROM node:22.16 as base

# # set the working direction
WORKDIR /app
COPY . .

# install app dependencies and build the app
RUN yarn install && yarn cache clean
RUN yarn build

FROM nginx:1.25.2 as final

# Copy built files
COPY .env /.env
COPY nginx_env_config.sh /docker-entrypoint.d/
RUN chmod 777 /docker-entrypoint.d/nginx_env_config.sh
COPY --from=base /app/dist /usr/share/nginx/html/

