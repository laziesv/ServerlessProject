FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.mod ./
COPY . .
RUN go test ./...
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/todo-backend .

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /bin/todo-backend /app/todo-backend
EXPOSE 8080
CMD ["/app/todo-backend"]
