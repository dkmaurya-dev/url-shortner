FROM node:20-alpine

WORKDIR /app

# 1️⃣ Copy package files
COPY package*.json ./

# 2️⃣ Copy prisma folder BEFORE npm ci
COPY prisma ./prisma

# 3️⃣ Install deps
RUN npm ci

# 4️⃣ Copy rest of the app
COPY . .

# 5️⃣ Generate Prisma client (explicit)
RUN npx prisma generate

# 6️⃣ Expose port
EXPOSE 3000

# 7️⃣ Start app
CMD ["npm", "run", "start"]
