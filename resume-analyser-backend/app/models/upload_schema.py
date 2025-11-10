from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class SuggestionType(str, Enum):
    KEYWORD = "keyword"
    FORMAT = "format"
    CONTENT = "content"
    STRUCTURE = "structure"

class Suggestion(BaseModel):
    type: SuggestionType
    title: str
    description: str
    priority: str #low, medium, high
    section: Optional[str] = None

class UploadResponseSchema(BaseModel):
    status: str
    message:str
    ats_score: int
    score_breakdown: dict
    suggestions: List[Suggestion]
    missing_keywords: List[dict]
    matched_keywords: List[dict]
    
class EnhancedResumeRequest(BaseModel):
    original_resume: str
    job_description: str
    missing_keywords: List[Dict[str, str]]
    suggestions: List[Dict[str, Any]]
    matched_keywords: List[Dict[str, str]]
    ats_score: int

class EnhancedResumeResponse(BaseModel):
    status: str
    message: str
    enhanced_resume: str
    changes_made: List[str]