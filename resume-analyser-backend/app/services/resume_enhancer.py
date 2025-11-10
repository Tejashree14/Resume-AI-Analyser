import re
from typing import List, Dict, Any
from app.models.upload_schema import UploadResponseSchema, Suggestion,EnhancedResumeRequest,EnhancedResumeResponse
from app.services.llm_analyser_service import OllamaResumeAnalyzer

class ResumeEnhancer:
    def __init__(self, model_name: str = "mistral"):
        self.llm = OllamaResumeAnalyzer(model_name=model_name)

    async def enhance_resume(
        self,
        original_resume: str,
        job_description: str,
        missing_keywords: List[Dict[str, str]],
        suggestions: List[Dict[str, Any]],
        matched_keywords: List[Dict[str, str]],
        ats_score: int
    ) -> Dict[str, Any]:
        """
        Enhance the resume by incorporating missing keywords and suggestions.
        Returns a dictionary with the enhanced resume and a list of changes made.
        """
        # Prepare the prompt for the LLM
        prompt = self._build_enhancement_prompt(
            original_resume,
            job_description,
            missing_keywords,
            suggestions,
            matched_keywords,
            ats_score
        )

        try:
            # Get the enhanced resume from LLM
            enhanced_resume = await self.llm.generate_text(prompt)
            
            # Extract the changes made
            changes_made = self._extract_changes(original_resume, enhanced_resume)
            
            return {
                "status": "success",
                "message": "Resume enhanced successfully",
                "enhanced_resume": enhanced_resume,
                "changes_made": changes_made
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to enhance resume: {str(e)}",
                "enhanced_resume": original_resume,
                "changes_made": []
            }

    def _build_enhancement_prompt(
        self,
        original_resume: str,
        job_description: str,
        missing_keywords: List[Dict[str, str]],
        suggestions: List[Dict[str, Any]],
        matched_keywords: List[Dict[str, str]],
        ats_score: int
    ) -> str:
        """Build the prompt for the LLM to enhance the resume."""
        prompt = f"""
        You are an expert resume writer and ATS (Applicant Tracking System) specialist. 
        Your task is to enhance the following resume by incorporating the missing keywords 
        and addressing the provided suggestions to improve its ATS score.

        JOB DESCRIPTION:
        {job_description}

        ORIGINAL RESUME:
        {original_resume}

        CURRENT ATS SCORE: {ats_score}/100

        MISSING KEYWORDS (high priority to include these):
        {self._format_keywords(missing_keywords)}

        SUGGESTIONS FOR IMPROVEMENT:
        {self._format_suggestions(suggestions)}

        MATCHED KEYWORDS (already present in resume):
        {self._format_keywords(matched_keywords)}

        INSTRUCTIONS:
        1. Maintain the original format and structure of the resume
        2. Naturally incorporate missing keywords where relevant
        3. Address the improvement suggestions
        4. Keep the content professional and concise
        5. Don't make up information that's not in the original resume
        6. Focus on enhancing the work experience and skills sections first
        7. Preserve all original contact information and dates

        Return ONLY the enhanced resume content, without any additional explanations or markdown formatting.
        """
        return prompt

    def _format_keywords(self, keywords: List[Dict[str, str]]) -> str:
        """Format keywords for the prompt."""
        return "\n".join([
            f"- {kw['keyword']} ({kw.get('importance', 'medium')} priority)" 
            for kw in keywords
            if 'keyword' in kw
        ])

    def _format_suggestions(self, suggestions: List[Dict[str, Any]]) -> str:
        """Format suggestions for the prompt."""
        formatted = []
        for i, suggestion in enumerate(suggestions, 1):
            formatted.append(
                f"{i}. {suggestion.get('title', 'Suggestion')} "
                f"({suggestion.get('priority', 'medium')} priority):\n"
                f"   {suggestion.get('description', 'No description')}\n"
                f"   Section: {suggestion.get('section', 'General')}"
            )
        return "\n\n".join(formatted)

    def _extract_changes(self, original: str, enhanced: str) -> List[str]:
        """Extract and summarize the changes made to the resume."""
        # This is a simple diff implementation - you might want to use a more robust diffing library
        original_lines = set(original.lower().split('\n'))
        enhanced_lines = set(enhanced.lower().split('\n'))
        
        # Find new lines in the enhanced resume
        new_lines = enhanced_lines - original_lines
        
        # Convert to list and clean up
        changes = [
            line.strip() for line in new_lines 
            if line.strip() and len(line.strip()) > 10  # Filter out very short lines
        ]
        
        return changes[:10]  # Return up to 10 most significant changes