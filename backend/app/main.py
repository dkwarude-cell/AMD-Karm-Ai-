"""
Karm AI — FastAPI Entry Point
Structured Serendipity Engine for College Students
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import drift, profile, bubble, events, discovery_slots, chat

app = FastAPI(
    title="Karm AI API",
    description="Anti-recommendation engine that engineers conditions for unexpected, meaningful experiences.",
    version="0.1.0"
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(drift.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(bubble.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(discovery_slots.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/")
async def root():
    return {"app": "Karm AI", "version": "0.1.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
