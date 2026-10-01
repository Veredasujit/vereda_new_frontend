# ---- Build Stage ----
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    
    RUN npm ci
    
    COPY . .
    
    COPY .env .env
    
    RUN npm run build
    
    # ---- Production Stage ----
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV PORT=5186
    ENV TZ=Asia/Kolkata
    
    RUN apk add --no-cache tzdata && \
        cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
        echo ${TZ} > /etc/timezone
    
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/next.config.* ./
    COPY --from=builder /app/.env ./
    
    EXPOSE 5186
    
    CMD ["npm", "start"]