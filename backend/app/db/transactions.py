from contextlib import contextmanager
from sqlalchemy.orm import Session
from typing import Generator

@contextmanager
def transaction_scope(db: Session) -> Generator[Session, None, None]:
    """
    Context manager for database transactions with automatic rollback on error.
    
    Usage:
        with transaction_scope(db) as session:
            # Do database operations
            session.execute(...)
            # If no exception, automatically commits
            # If exception occurs, automatically rolls back
    """
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
