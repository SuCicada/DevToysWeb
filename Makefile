install:
	npm install --legacy-peer-deps

clean:
	npx rimraf .next
dev:
	npx next dev -p 6001
dev-https:
	npx local-ssl-proxy --key ./localhost-key.pem --cert ./localhost.pem --source 6002 --target 6001


build:
	npm run postbuild
	npm run build

start:
	npx next start -p 6001

vercel-env-update:
	node ./scripts/vercel-env-update.js production

