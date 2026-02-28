"""
Chat assistant routes — KarmBot conversational assistant with budget/constraint awareness.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random

from ...db.database import db

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    query: str
    student_id: Optional[str] = None


class ChatEventResult(BaseModel):
    title: str
    department: str
    duration_minutes: int
    is_free: bool
    why: str


class ChatResponse(BaseModel):
    message: str
    results: List[ChatEventResult] = []
    follow_up: Optional[str] = None


@router.post("/ask", response_model=ChatResponse)
async def chat_ask(req: ChatMessage):
    """
    Conversational assistant with budget & constraint awareness.
    Parses natural-language-like queries and returns filtered, scored events.
    """
    q = req.query.lower()
    student = db.students.get(req.student_id) if req.student_id else None
    attractor = db.attractors.get(req.student_id) if req.student_id else None

    events = list(db.events)
    explanation = ""

    # Time-of-day filters
    if "tonight" in q or "evening" in q:
        events = [e for e in events if e.start_time.hour >= 17]
        explanation = "Evening events"

    # Type filters
    if "workshop" in q:
        events = [e for e in events if e.type == "workshop"]
        explanation = "Workshops"
    elif any(word in q for word in ["talk", "lecture"]):
        events = [e for e in events if e.type == "talk"]
        explanation = "Talks & lectures"
    elif any(word in q for word in ["social", "meet", "people", "network"]):
        events = [e for e in events if e.type in ("social", "performance")]
        explanation = "Social & interactive events"

    # Budget constraints
    if "free" in q or (student and student.free_only):
        events = [e for e in events if e.is_free]
        explanation += (". " if explanation else "") + "Free only"

    # Time constraint
    time_limit = student.time_budget_minutes if student else 120
    import re
    m = re.search(r"(\d+)\s*min", q)
    if m:
        time_limit = int(m.group(1))
    elif "short" in q or "quick" in q:
        time_limit = 30

    if time_limit < 120 or "short" in q or "quick" in q or m:
        events = [e for e in events if e.duration_minutes <= time_limit]
        explanation += (". " if explanation else "") + f"Under {time_limit}min"

    if not events:
        return ChatResponse(
            message=f"No events match \"{req.query}\". Try relaxing your constraints.",
            results=[],
            follow_up="Say 'What's happening tonight?' to see all available events."
        )

    # Generate "why this" for each result
    results = []
    visited = set(attractor.departments_visited) if attractor else set()
    interests = set(student.interests) if student else set()

    for evt in events[:3]:
        reasons = []
        if evt.department not in visited:
            reasons.append(f"New dept — breaks your bubble")
        matching = [a for a in evt.expected_attendees if a.lower() in {i.lower() for i in interests}]
        if matching:
            reasons.append(f"Matches: {', '.join(matching)}")
        if evt.is_free:
            reasons.append("Free")
        if evt.discovery_slot:
            reasons.append("Discovery slot")
        why = " • ".join(reasons) if reasons else "Could be your next meaningful collision"

        results.append(ChatEventResult(
            title=evt.title,
            department=evt.department,
            duration_minutes=evt.duration_minutes,
            is_free=evt.is_free,
            why=why
        ))

    return ChatResponse(
        message=f"{explanation or 'Best matches'}. Found {len(results)} option{'s' if len(results) > 1 else ''}:",
        results=results,
        follow_up="Want me to narrow it down? Tell me your time limit or type preference."
    )
