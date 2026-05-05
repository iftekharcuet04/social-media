FROM node:20-alpine AS builder

WORKDIR /app

COPY . . 

RUN npm install

# ... after npm install
RUN npm install -g ts-node-dev


RUN npm run build

# # -------- Runtime --------
# FROM node:20-alpine

# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/package*.json ./

# RUN npm install --omit=dev

EXPOSE 3000
# Generate Prisma client and start in dev mode
CMD ["sh", "-c", "npx prisma generate && npm run dev"]

