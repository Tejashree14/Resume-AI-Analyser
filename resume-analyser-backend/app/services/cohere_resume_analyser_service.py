import os
import json
import re
import logging
from typing import Optional, Dict, Any
import cohere
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise RuntimeError("COHERE_API_KEY is not set. Please add it to your .env file.")


class CohereResumeAnalyzer:
    """
    Refined AI-based Resume Analyzer using Cohere LLM.
    Provides stable, accurate ATS scoring and structured insights.
    """

    def __init__(self, model_name: str = "command-a-03-2025", max_tokens: int = 1024):
        self.client = cohere.Client(COHERE_API_KEY)
        self.model_name = model_name
        self.max_tokens = max_tokens
        self.prompt_template = self._build_prompt()

    # -----------------------------------------------------
    # 🔹 Prompt Engineering (Balanced, Clear, Deterministic)
    # -----------------------------------------------------
    def _build_prompt(self) -> str:
        return """
You are an unbiased AI resume analyzer that evaluates how well a resume matches a job description.

Objective:
Provide an **ATS-style analysis** focusing on skills, responsibilities, and experience match. Ignore irrelevant sections like "About the Company", "Culture", or "Benefits".

Scoring Criteria:
- 60% Keyword Match (skills, tools, frameworks)
- 30% Role & Experience Similarity
- 10% Resume Quality (quantification, structure, clarity)

Scoring Guide:
- 90–100 → Excellent match
- 75–89 → Strong match
- 60–74 → Moderate match
- 40–59 → Weak match
- Below 40 → Poor match

Suggestions Policy:
- Always include at least 3 and at most 5 meaningful suggestions.
- Suggestion types: "keyword", "content", "format", "structure".
- Include only keywords found in the job description.
- Avoid generic suggestions; be resume-specific.

Resume:
\"\"\"{resume_text}\"\"\"

Job Description:
\"\"\"{job_description}\"\"\"

Return ONLY valid JSON (no markdown, no commentary) following this schema:
{{
  "ats_score": <0–100>,
  "score_breakdown": {{
    "keywords": <0–100>,
    "similarity": <0–100>,
    "quality": <0–100>
  }},
  "matched_keywords": [
    {{"keyword": "<string>", "relevance": "<low|medium|high>"}}
  ],
  "missing_keywords": [
    {{"keyword": "<string>", "importance": "<low|medium|high>"}}
  ],
  "suggestions": [
    {{
      "type": "<keyword|content|format|structure>",
      "title": "<string>",
      "description": "<string>",
      "priority": "<low|medium|high>",
      "section": "<Work Experience|Education|Skills|Projects|Other>"
    }}
  ]
}}
"""


    # -----------------------------------------------------
    #  Resume Analysis
    # -----------------------------------------------------
    def analyze_resume(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        prompt = self.prompt_template.format(
            resume_text=(resume_text or "")[:4000],
            job_description=(job_description or "")[:4000]
        )

        try:
            response = self.client.chat(
                model=self.model_name,
                message=prompt,
                max_tokens=self.max_tokens,
                temperature=0.0
            )

            raw_output = response.text.strip()
            result = self._parse_response(raw_output)
            return self._normalize_scoring(result)

        except Exception as e:
            logger.error(f"Error calling Cohere API: {e}")
            raise

    # -----------------------------------------------------
    # Safe JSON Extraction
    # -----------------------------------------------------
    def _parse_response(self, response: str) -> Dict[str, Any]:
        try:
            if isinstance(response, dict):
                return response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return json.loads(response)
        except Exception as e:
            logger.error(f"Failed to parse Cohere response: {str(e)} | Raw: {response[:500]}")
            raise ValueError("Invalid JSON response from Cohere model.")

    # -----------------------------------------------------
    # Scoring Normalization Logic
    # -----------------------------------------------------
    def _normalize_scoring(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adds a stability layer to ensure realistic ATS scores.
        Uses weighted formula and smoothing for fairness.
        """
        sb = result.get("score_breakdown", {})

        keywords = sb.get("keywords", 0)
        similarity = sb.get("similarity", 0)
        quality = sb.get("quality", 0)

        # Weighted composite (more realistic)
        weighted_score = (0.6 * keywords) + (0.3 * similarity) + (0.1 * quality)

        # Apply soft floor: if both keyword/similarity are strong, avoid under-rating
        if keywords > 50 and similarity > 75:
            weighted_score += 5

        # Apply upper clamp
        weighted_score = min(round(weighted_score), 100)

        result["ats_score"] = weighted_score
        result["score_breakdown"] = {
            "keywords": keywords,
            "similarity": similarity,
            "quality": quality
        }

        return result
