# ─── Base Image ───────────────────────────────────────────
FROM node:20-alpine

# ─── Set Working Directory ────────────────────────────────
WORKDIR /app

# ─── Install Dependencies ─────────────────────────────────
COPY package*.json ./
RUN npm install

# ─── Copy App Code ────────────────────────────────────────
COPY . .

# ─── Expose Port ──────────────────────────────────────────
EXPOSE 5173

# ─── Start Command ────────────────────────────────────────
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]