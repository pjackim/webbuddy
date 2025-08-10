# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:latest AS base
WORKDIR /usr/src/app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
ARG RUN_TESTS=false
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
# Install Node.js + npm and run tests only when explicitly requested
RUN if [ "$RUN_TESTS" = "true" ]; then \
			set -eux; \
			apt-get update; \
			apt-get install -y --no-install-recommends nodejs npm; \
			npx vitest run --project server --pool=forks; \
			apt-get purge -y --auto-remove nodejs npm; \
			rm -rf /var/lib/apt/lists/*; \
		else \
			echo "Skipping Vitest during Docker build"; \
		fi
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
ARG NODE_ENV=production
ARG HOST=0.0.0.0
ARG PORT=3000
ENV NODE_ENV=${NODE_ENV}
ENV HOST=${HOST}
ENV PORT=${PORT}
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.svelte-kit/output .svelte-kit/output
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE ${PORT}/tcp
# Use env-driven host/port for preview
CMD ["sh", "-lc", "bun run preview --host \"${HOST:-0.0.0.0}\" --port \"${PORT:-3000}\""]
