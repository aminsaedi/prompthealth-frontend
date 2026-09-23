FROM node:14-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# The install is the one step that depends on a network it does not control,
# and a registry hiccup here fails a build that has nothing wrong with it. Try
# again once before giving up; a real problem fails the same way twice.
RUN npm ci --no-audit --no-fund || (sleep 20 && npm ci --no-audit --no-fund)
COPY scripts/patch-angular-compiler.js scripts/
RUN node scripts/patch-angular-compiler.js
COPY . .
# prebuild:ssr runs the sitemap date generator here too. There is no git in
# this stage, so it keeps the dates CI wrote into the build context
# (.github/workflows/deploy.yml) instead of computing any.
RUN npm run build:ssr

FROM node:14-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server-wrapper.js ./dist/wellness-frontend/server/server-wrapper.js
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/wellness-frontend/server/server-wrapper.js"]
