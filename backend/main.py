"""FastAPI backend for the Edo Japan Study App."""

from dotenv import load_dotenv
load_dotenv()

from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from content import (
    get_categories,
    get_explain_prompts_without_rubrics,
    get_flashcards,
    get_prompt_by_id,
    get_quiz_questions,
    get_stats,
)
from evaluate import evaluate_answer

app = FastAPI(title="Edo Japan Study App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class EvaluateRequest(BaseModel):
    prompt_id: str
    student_answer: str


class EvaluateResponse(BaseModel):
    points_hit: list[str]
    points_missed: list[str]
    score: int
    total: int
    praise: str
    hint: str
    model_answer: str


@app.get("/api/flashcards")
def flashcards(category: Optional[str] = None, difficulty: Optional[str] = None):
    return get_flashcards(category=category, difficulty=difficulty)


@app.get("/api/quiz/questions")
def quiz_questions(
    count: Optional[int] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
):
    return get_quiz_questions(count=count, category=category, difficulty=difficulty)


@app.get("/api/explain/prompts")
def explain_prompts(
    category: Optional[str] = None, difficulty: Optional[str] = None
):
    return get_explain_prompts_without_rubrics(category=category, difficulty=difficulty)


@app.post("/api/explain/evaluate", response_model=EvaluateResponse)
async def explain_evaluate(req: EvaluateRequest):
    prompt = get_prompt_by_id(req.prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if not req.student_answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty")
    try:
        result = await evaluate_answer(
            prompt_text=prompt["prompt"],
            rubric=prompt["rubric"],
            student_answer=req.student_answer,
        )
    except EnvironmentError:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY is not set. Please set it as an environment variable to use Explain mode.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return result


@app.get("/api/categories")
def categories():
    return get_categories()


@app.get("/api/stats")
def stats():
    return get_stats()
