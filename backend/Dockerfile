# ─── Base Image ───────────────────────────────────────────
# We use Python 3.11 slim — stable, lightweight, production ready
FROM python:3.11-slim

# ─── Set Working Directory ────────────────────────────────
# All commands from here run inside /app inside the container
WORKDIR /app

# ─── Install System Dependencies ─────────────────────────
# These are needed by some Python packages to compile
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ─── Install Python Dependencies ─────────────────────────
# Copy requirements first — Docker caches this layer
# So if code changes but requirements don't, this step is skipped
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ─── Copy App Code ────────────────────────────────────────
COPY . .

# ─── Create logs directory ────────────────────────────────
RUN mkdir -p /app/logs

# ─── Expose Port ──────────────────────────────────────────
EXPOSE 8000

# ─── Start Command ────────────────────────────────────────
# uvicorn = the server that runs FastAPI
# --reload = auto restart when code changes (development only)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]