import os
import json
import re
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pymupdf
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Resume Analyzer API")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://*.vercel.app",  # Wildcard for Vercel preview & prod deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:5173|http://127\.0\.0\.1:5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health-check route for Render keep-alive
@app.get("/")
def health_check():
    return {"status": "ok", "service": "DocuMatch ATS API"}


groq_client = None
if os.getenv("GROQ_API_KEY"):
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# --- Pydantic Data Contracts ---
class WorkExperience(BaseModel):
    company: str = Field(description="Company or Organization name")
    role: str = Field(description="Job Title")
    duration: Optional[str] = Field(default="", description="Employment period, e.g. 2022 - 2024")
    achievements: List[str] = Field(default_factory=list, description="Key accomplishments or bullet points")

class EducationItem(BaseModel):
    institution: str = Field(description="College, University or School")
    degree: str = Field(description="Degree or Certification earned")
    year: Optional[str] = Field(default="", description="Year or graduation date")

class BulletRewrite(BaseModel):
    original: str = Field(description="The weak or passive bullet from resume")
    rewritten: str = Field(description="High-impact rewritten version with strong verb and measurable outcome")
    reason: str = Field(description="Why this improves ATS or human recruiter impression")

class StructuredAnalysisResponse(BaseModel):
    name: Optional[str] = "Unknown"
    email: Optional[str] = ""
    phone: Optional[str] = ""
    linkedin: Optional[str] = ""
    summary: Optional[str] = ""
    work_experience: List[WorkExperience] = []
    education: List[EducationItem] = []
    hard_skills: List[str] = []
    soft_skills: List[str] = []
    bullet_rewrites: List[BulletRewrite] = []
    ats_score: int
    feedback_notes: List[str] = []

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def parse_with_llm(resume_text: str, jd_text: str = "") -> StructuredAnalysisResponse:
    if not groq_client:
        return StructuredAnalysisResponse(
            name="Sample Candidate",
            ats_score=75,
            hard_skills=["React", "TypeScript", "Python"],
            soft_skills=["Communication"],
            feedback_notes=["Add GROQ_API_KEY to your backend .env to unlock real-time LLM parsing."]
        )

    # Automatically find an active Llama model from your Groq account
    available_models = [m.id for m in groq_client.models.list().data]
    
    preferred_models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama3-70b-8192",
        "llama3-8b-8192",
        "mixtral-8x7b-32768",
        "gemma2-9b-it"
    ]
    
    selected_model = None
    for model in preferred_models:
        if model in available_models:
            selected_model = model
            break

    if not selected_model:
        selected_model = available_models[0]  # Fallback to the first available model

    print(f"--> Using Groq Model: {selected_model}")

    system_prompt = (
        "You are an elite Executive Tech Recruiter and ATS Auditor. "
        "Analyze the provided resume and optional Job Description. "
        "Extract the candidate's personal data, career history, education, and technical competencies. "
        "Select up to 3 weak/passive bullet points from the work experience and rewrite them using the Google X-Y-Z formula: "
        "'Accomplished [X] as measured by [Y], by doing [Z]'. "
        "Calculate an honest ATS compatibility score between 20 and 95 based on technical relevancy, impact verbs, and formatting clarity. "
        "Return STRICT JSON only matching this schema: "
        "{"
        "  \"name\": string, \"email\": string, \"phone\": string, \"linkedin\": string, \"summary\": string, "
        "  \"work_experience\": [{\"company\": string, \"role\": string, \"duration\": string, \"achievements\": [string]}], "
        "  \"education\": [{\"institution\": string, \"degree\": string, \"year\": string}], "
        "  \"hard_skills\": [string], \"soft_skills\": [string], "
        "  \"bullet_rewrites\": [{\"original\": string, \"rewritten\": string, \"reason\": string}], "
        "  \"ats_score\": integer, \"feedback_notes\": [string]"
        "}"
    )

    user_prompt = f"""
    TARGET JOB DESCRIPTION:
    {jd_text if jd_text.strip() else "General Full-Stack Software Engineering role."}

    RESUME CONTENT:
    {resume_text[:4000]}
    """

    chat_completion = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",  # <-- Use one of the exact IDs from your list
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    parsed_json = json.loads(chat_completion.choices[0].message.content)
    return StructuredAnalysisResponse(**parsed_json)

@app.post("/api/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form("")
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are currently supported.")

    file_bytes = await file.read()
    raw_text = extract_text_from_pdf(file_bytes)

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text. The PDF might be an image scan.")

    # Call LLM Parser
    try:
        analysis_data = parse_with_llm(raw_text, job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM parsing failed: {str(e)}")

    # Calculate Radar data
    skills_count = len(analysis_data.hard_skills)
    radar_data = [
        {"subject": "Skills Match", "score": min(skills_count * 10, 95)},
        {"subject": "Impact Verbs", "score": min(len(analysis_data.bullet_rewrites) * 30 + 30, 95)},
        {"subject": "Experience Depth", "score": min(len(analysis_data.work_experience) * 25 + 30, 95)},
        {"subject": "ATS Formatting", "score": analysis_data.ats_score},
    ]

    return {
        "filename": file.filename,
        "radar_data": radar_data,
        "data": analysis_data.model_dump(),
        "preview_text": raw_text[:300] + "..."
    }