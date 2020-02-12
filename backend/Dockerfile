FROM golang:1.13 as builder

WORKDIR /app
COPY /backend /app

RUN pwd
RUN go get -d -v

# Statically compile our app for use in a distroless container
RUN CGO_ENABLED=0 go build -ldflags="-w -s" -v -o api .

# A distroless container image with some basics like SSL certificates
# https://github.com/GoogleContainerTools/distroless
FROM gcr.io/distroless/static

# Copy over binary and seed data
COPY --from=builder /app/api /api
COPY --from=builder /app/seed_data /seed_data

ENTRYPOINT ["/api"]
