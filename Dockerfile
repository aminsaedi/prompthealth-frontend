FROM node:14-alpine
WORKDIR /app
COPY dist ./dist
COPY server-wrapper.js ./dist/wellness-frontend/server/server-wrapper.js
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/wellness-frontend/server/server-wrapper.js"]
