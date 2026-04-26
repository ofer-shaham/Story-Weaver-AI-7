FROM node:20-bullseye-slim

WORKDIR /app

COPY . .

RUN corepack enable \
  && corepack pnpm install --frozen-lockfile

EXPOSE 5173

CMD ["pnpm", "--filter", "@workspace/story-app", "run", "dev"]
