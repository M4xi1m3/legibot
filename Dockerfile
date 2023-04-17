# Use node lts
FROM node:lts-alpine

# Set working directory
WORKDIR /legibot/

RUN apk add --no-cache libtool make autoconf automake alpine-sdk python3 pixman-dev cairo-dev pango-dev

# Install dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
RUN sed -i 's/\.\/dist\/js\/index\.cjs/\.\/dist\/js\/index\.js/g' node_modules/canvas-hypertxt/package.json 
RUN sed -i 's/\.\/dist\/cjs\/index\.js/\.\/dist\/cjs\/index\.cjs/g' node_modules/canvas-hypertxt/package.json

# Build
COPY . ./
RUN yarn build

CMD node dist/index.js
