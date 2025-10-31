# pull the base image
ARG BASE_IMAGE="artefact.skao.int/ska-build-node:0.1.2"
ARG FINAL_IMAGE="ska-web-server:0.1.4"
FROM $BASE_IMAGE AS base

# # set the working direction
WORKDIR /app
COPY . .

# install app dependencies and build the app
RUN yarn install && yarn cache clean

RUN yarn build

FROM $FINAL_IMAGE as final

# Copy built files
COPY --from=base /app/dist /usr/share/nginx/html/
COPY --from=base /app/scripts/write_env_js.sh /docker-entrypoint.d/50-write_env_js.sh

RUN chmod +x /docker-entrypoint.d/50-write_env_js.sh