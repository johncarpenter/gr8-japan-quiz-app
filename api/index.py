"""Vercel serverless entry point — wraps the FastAPI app."""

import sys
from pathlib import Path

# Add backend/ to import path so content.py and evaluate.py are importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from main import app  # noqa: E402, F401
