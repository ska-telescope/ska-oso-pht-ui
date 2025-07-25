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
COPY --from=base /app/dist /usr/share/nginx/html/
COPY --from=base /app/scripts/write_env_js.sh /docker-entrypoint.d/50-write_env_js.sh

RUN chmod +x /docker-entrypoint.d/50-write_env_js.sh