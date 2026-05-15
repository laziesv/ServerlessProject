# ---------- Build Stage ----------
FROM golang:1.22-alpine AS builder

WORKDIR /app

# dependencies cache
COPY go.mod go.sum ./
RUN go mod download

# copy source
COPY . .

# build binary
RUN go build -o server .

# ---------- Run Stage ----------
FROM alpine:latest

WORKDIR /app

# timezone + cert (สำคัญกับ DB / HTTPS)
RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]