FROM node:14-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY scripts/patch-angular-compiler.js scripts/
RUN node scripts/patch-angular-compiler.js
COPY . .
RUN npm run build:ssr

FROM node:14-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server-wrapper.js ./dist/wellness-frontend/server/server-wrapper.js
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/wellness-frontend/server/server-wrapper.js"]
