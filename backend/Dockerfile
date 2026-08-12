FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY *.go ./
RUN CGO_ENABLED=0 go build -o /out/server .

FROM alpine:3.20
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /out/server ./server
RUN mkdir -p /data && chown -R app:app /data /app
USER app
ENV PORT=8080 DATA_FILE=/data/tasks.json
EXPOSE 8080
CMD ["./server"]
