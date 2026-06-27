FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node server.js db.json ./
COPY --chown=node:node public ./public
COPY --chown=node:node dist ./dist
RUN mkdir -p data backups && chown -R node:node /app/data /app/backups
USER node
EXPOSE 3001
CMD ["node", "server.js"]
