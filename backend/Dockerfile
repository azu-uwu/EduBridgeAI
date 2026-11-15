FROM node:22-alpine

WORKDIR /app

# Sao chép file cấu hình dependency
COPY package*.json ./

# Cài đặt dependency production
RUN npm ci --omit=dev

# Sao chép mã nguồn backend
COPY . .

EXPOSE 5000

ENV NODE_ENV=production \
    PORT=5000 \
    AI_MODE=mock

CMD ["npm", "start"]
