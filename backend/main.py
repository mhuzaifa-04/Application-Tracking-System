from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import re

app = FastAPI(title="Resume Analyzer API")

# Allow your React app to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def calculate_ats_metrics(resume_text: str, jd_text: str = ""):
    text_lower = resume_text.lower()
    
    # 1. Action verbs detection
    action_verbs = [
        "architected", "engineered", "developed", "designed", "implemented",
        "optimized", "managed", "spearheaded", "orchestrated", "automated",
        "built", "delivered", "deployed"
    ]
    found_verbs = [verb for verb in action_verbs if re.search(r'\b' + verb + r'\b', text_lower)]
    
    # 2. Measurable Metrics (numbers, percentages, dollar values)
    metrics = re.findall(r'(\d+[\%kK\+]|\$\d+)', resume_text)
    metrics_count = len(metrics)
    
    # 3. Tech Skill Matching
    matched_skills = []
    missing_skills = []
    skills_pool = [
        "react", "typescript", "javascript", "python", "fastapi", "docker",
        "sql", "postgresql", "git", "tailwind", "aws", "node.js", "c#", "angular"
    ]
    
    if jd_text.strip():
        jd_lower = jd_text.lower()
        for skill in skills_pool:
            if skill in jd_lower:
                if skill in text_lower:
                    matched_skills.append(skill.title())
                else:
                    missing_skills.append(skill.title())
    else:
        # Default scan if no JD provided
        for skill in skills_pool:
            if skill in text_lower:
                matched_skills.append(skill.title())

    # Category breakdown for radar chart (0 - 100)
    skill_score = 80 if not jd_text.strip() else int((len(matched_skills) / max(len(matched_skills) + len(missing_skills), 1)) * 100)
    verb_score = min(len(found_verbs) * 15, 100)
    metrics_score = min(metrics_count * 20, 100)
    brevity_score = 90 if 300 <= len(resume_text.split()) <= 800 else 65

    overall_score = int((skill_score * 0.4) + (verb_score * 0.25) + (metrics_score * 0.2) + (brevity_score * 0.15))

    # Actionable Suggestions Engine
    suggestions = []
    if len(found_verbs) < 4:
        suggestions.append({
            "type": "verb",
            "title": "Strengthen Action Verbs",
            "detail": "Replace passive duties (e.g., 'Worked on', 'Responsible for') with executive verbs like 'Architected', 'Optimized', or 'Spearheaded'."
        })
    if metrics_count < 3:
        suggestions.append({
            "type": "metric",
            "title": "Add Measurable Impact",
            "detail": "Include at least 3 concrete numbers or percentages (e.g., 'Decreased latency by 35%', 'Scaled API to 10k users')."
        })
    if missing_skills:
        suggestions.append({
            "type": "skill",
            "title": "Bridge Key Skill Gaps",
            "detail": f"The job description mentions {', '.join(missing_skills[:3])}. Add relevant projects or proficiencies covering these."
        })

    return {
        "overall_score": overall_score,
        "radar_data": [
            {"subject": "Skills Match", "score": skill_score},
            {"subject": "Action Verbs", "score": verb_score},
            {"subject": "Impact Metrics", "score": metrics_score},
            {"subject": "Brevity & Density", "score": brevity_score},
        ],
        "action_verbs": found_verbs,
        "quantifiable_metrics_count": metrics_count,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
        "word_count": len(resume_text.split()),
    }
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

    analysis = calculate_ats_metrics(raw_text, job_description)

    return {
        "filename": file.filename,
        "analysis": analysis,
        "preview_text": raw_text[:300] + "..."
    }