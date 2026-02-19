from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, DateTime, func


class Base(DeclarativeBase):
    """
    Base class that all database models inherit from.
    Every table in our database will extend this class.
    Think of it as a template every table starts with.
    """
    pass