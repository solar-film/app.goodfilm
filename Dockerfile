FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
RUN VITE_COPY_PUBLIC=false npm run build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node server.js db.json ./
COPY --chown=node:node public ./public
COPY --chown=node:node --from=build /app/dist ./dist
RUN mkdir -p data backups && chown -R node:node /app/data /app/backups
USER node
EXPOSE 3001
CMD ["node", "server.js"]
