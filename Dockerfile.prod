FROM node:22.9.0-alpine AS dependencies
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

FROM dependencies AS build

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
