install:
	npm install --legacy-peer-deps

clean:
	npx rimraf .next
dev:
	npx next dev -p 6001

build:
	npm run postbuild
	npm run build

start:
	npx next start -p 6001
