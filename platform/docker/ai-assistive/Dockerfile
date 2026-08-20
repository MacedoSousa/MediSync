FROM node:22-alpine

WORKDIR /srv/medsync-assistive
COPY policy.mjs gateway.mjs ./

RUN addgroup -S medsync && adduser -S medsync -G medsync
USER medsync
EXPOSE 8088
CMD ["node", "gateway.mjs"]
