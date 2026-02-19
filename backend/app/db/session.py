from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings

# ─── Database Engine ──────────────────────────────────────────────────────────
# Think of the engine as the "connection" to your database
# echo=True means it prints every SQL query in development (useful for debugging)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.is_development,
    pool_size=10,        # Max 10 permanent connections
    max_overflow=20,     # Allow 20 extra connections if needed
    pool_pre_ping=True,  # Test connection before using it
)

# ─── Session Factory ──────────────────────────────────────────────────────────
# A session = one conversation with the database
# Like opening and closing a tab — you open it, do your work, close it
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ─── Dependency ───────────────────────────────────────────────────────────────
# This function is used by FastAPI routes to get a database session
# The "yield" means: open session → do work → close session automatically
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()