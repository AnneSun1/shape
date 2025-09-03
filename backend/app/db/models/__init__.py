# This file makes the models directory a Python package

# Import all models so they are registered with SQLAlchemy
from .user import User
from .chat import Chat
from .message import Message

__all__ = ["User", "Chat", "Message"]
