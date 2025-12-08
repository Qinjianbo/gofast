.PHONY: clean build

APP_NAME = server
BUILD_DIR = $(PWD)/build

up:
	docker compose up -d

down:
	docker compose down

clean:
	rm -rf ./build
	rm -rf ./dist
	rm -rf ./web/dist

build:
	# build the backend
	go build -ldflags="-w -s" -o $(BUILD_DIR)/$(APP_NAME) main.go

web:
	cd web && pnpm build

webdev:
	pnpm --dir web run dev	

typecheck:
	pnpm --dir web run typecheck