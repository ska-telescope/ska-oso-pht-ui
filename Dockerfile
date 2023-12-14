# pull the base image
FROM node:18.12.1 as base

# # set the working direction
WORKDIR /app
COPY . .

# install app dependencies
RUN yarn install && yarn cache clean

EXPOSE 8090

# start app
CMD ["yarn", "start"]

FROM base as builder

RUN yarn webpack build \
    --optimization-concatenate-modules \
    --optimization-minimize \
    --mode production \
    --output-clean --output-path /dist/

FROM nginx:1.25.2 as final

# Copy built files
COPY --from=builder /dist/* /usr/share/nginx/html/
