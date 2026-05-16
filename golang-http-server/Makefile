.PHONY: dev test lint fmt build vendor fullcheck clean

dev:
	air

test:
	go test -v -cover ./internal/...

lint:
	golangci-lint run ./...

fmt:
	go fmt ./...

build:
	go build -o bin/server ./

vendor:
	go mod vendor

fullcheck: fmt lint test build

clean:
	rm -rf bin/ coverage.out
