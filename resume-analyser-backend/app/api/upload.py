# app/api/upload.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
import os
import logging
from typing import Dict, Any
from app.services.file_handler import save_uploaded_file, extract_text_from_file
from app.services.cohere_resume_analyser_service import CohereResumeAnalyzer
from app.services.resume_enhancer import ResumeEnhancer
from app.models.upload_schema import UploadResponseSchema, Suggestion, EnhancedResumeRequest, EnhancedResumeResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()
analyzer = CohereResumeAnalyzer()
enhancer = ResumeEnhancer()

def format_suggestion(suggestion: Dict[str, Any]) -> Dict[str, Any]:
    """Format a suggestion with default values for all required fields."""
    return {
        "type": suggestion.get("type", "content"),
        "title": suggestion.get("title", "Suggestion"),
        "description": suggestion.get("description", ""),
        "priority": suggestion.get("priority", "medium"),
        "section": suggestion.get("section", "Other")
    }

@router.get("/upload")
async def get_upload_page():
    return {"message": "Please use the frontend interface to upload your resume."}

@router.post("/upload", response_model=UploadResponseSchema)
async def upload_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Upload and analyze a resume against a job description.
    
    Args:
        resume: The resume file to analyze (PDF, DOC, or DOCX)
        job_description: The job description to analyze against
        
    Returns:
        Analysis results including ATS score, suggestions, and keyword matches
    """
    # Input validation
    job_description = job_description.strip()
    if len(job_description) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Job description must be at least 50 characters long"}
        )
    
    if not resume.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "No file provided"}
        )
    
    temp_file_path = None
    try:
        logger.info(f"Processing file: {resume.filename}, size: {resume.size} bytes")
        
        # Save file temporarily
        temp_file_path = await save_uploaded_file(resume)
        
        # Extract text from the file
        resume_text = extract_text_from_file(temp_file_path)
        if not resume_text or len(resume_text.strip()) < 10:  # Basic validation
            raise ValueError("The uploaded file appears to be empty or could not be processed")
            
        logger.info(f"Extracted {len(resume_text)} characters from resume")
        
        # Analyze the resume
        analysis = analyzer.analyze_resume(resume_text, job_description)
        
        # Format response to match UploadResponseSchema
        response = {
            "status": "success",
            "message": "Resume analyzed successfully",
            "ats_score": analysis.get("ats_score", 0),
            "score_breakdown": analysis.get("score_breakdown", {"keywords": 0, "similarity": 0}),
            "suggestions": [
                format_suggestion(s) 
                for s in analysis.get('suggestions', [])
                if isinstance(s, dict)
            ],
            "missing_keywords": analysis.get("missing_keywords", []),
            "matched_keywords": analysis.get("matched_keywords", [])
        }
        
        logger.info(f"Analysis complete. ATS Score: {response['ats_score']}")
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
        
    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": f"Failed to process resume: {str(e)}"}
        )
        
    finally:
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to remove temp file {temp_file_path}: {e}")

@router.post("/enhance-resume", response_model=EnhancedResumeResponse)
async def enhance_resume(request: EnhancedResumeRequest):
    """
    Enhance a resume by incorporating missing keywords and suggestions.
    
    Args:
        request: The enhancement request containing resume text and analysis
        
    Returns:
        Enhanced resume text with suggestions incorporated
    """
    try:
        result = await enhancer.enhance_resume(
            original_resume=request.original_resume,
            job_description=request.job_description,
            missing_keywords=request.missing_keywords,
            suggestions=request.suggestions,
            matched_keywords=request.matched_keywords,
            ats_score=request.ats_score
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
            
        return EnhancedResumeResponse(
            status="success",
            message="Resume enhanced successfully",
            enhanced_resume=result["enhanced_resume"],
            changes_made=result["changes_made"]
        )
        
    except Exception as e:
        logger.error(f"Error enhancing resume: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": f"Failed to enhance resume: {str(e)}"}
        )
