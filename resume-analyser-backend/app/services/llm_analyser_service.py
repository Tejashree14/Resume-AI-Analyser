# Add this import at the top
import requests
import json
import requests

class OllamaResumeAnalyzer:
    def __init__(self, model_name="mistral"):
        self.model = model_name
        self.api_url = "http://localhost:11434/api/generate"

    async def generate_text(self, prompt: str, max_tokens: int = 4000) -> str:
        """
        Generate text using the Ollama API.
        
        Args:
            prompt: The prompt to send to the model
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            The generated text from the model
        """
        try:
            response = requests.post(
                self.api_url,
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "max_tokens": max_tokens
                    }
                },
                timeout=300  # 5 minute timeout for generation
            )
            
            if response.status_code != 200:
                raise RuntimeError(f"Ollama API error: {response.text}")
                
            return response.json().get("response", "")
            
        except Exception as e:
            raise RuntimeError(f"Error generating text: {str(e)}")

    def analyze_resume_with_llm(self, resume_text: str, job_description: str) -> dict:
        prompt = self._build_prompt(resume_text, job_description)

        response = requests.post(
            self.api_url,
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0  # Make output deterministic
                }
            },
            timeout=100
        )
    
        if response.status_code != 200:
            raise RuntimeError(f"Ollama API error: {response.text}")
    
    
        result = response.json().get("response", "")
        parsed = self._parse_response(result)

        for suggestion in parsed.get("suggestions", []):
            if "type" not in suggestion:
                suggestion["type"] = "content"  # or "structure" or any default value

        # 🛠 Fix: Add score breakdown manually
        matched = len(parsed.get("matched_keywords", []))
        missing = len(parsed.get("missing_keywords", []))
        total = matched + missing

        parsed["score_breakdown"] = {
            "keywords": (matched / max(1, total)) * 100,
            "similarity": parsed.get("ats_score", 0)
        }

        parsed["ats_score"] = int((parsed["score_breakdown"]["keywords"] + parsed["score_breakdown"]["similarity"]) / 2)


        return parsed


#     def _build_prompt(self, resume: str, job_desc: str) -> str:
#         resume = resume[:3000]
#         job_desc = job_desc[:1500]
#         return f"""
# You are an AI system that analyzes a resume and job description and returns JSON only. 
# Do not include any commentary, explanation, or markdown. Return only a valid JSON response 
# matching this structure exactly:

# {{
#   "ats_score": <int from 0 to 100>,
#   "suggestions": [
#     {{
#       "title": "string",
#       "description": "string",
#       "priority": "low|medium|high",
#       "section": "string"
#     }}
#   ],
#   "matched_keywords": [
#     {{
#       "keyword": "string",
#       "relevance": "low|medium|high"
#     }}
#   ],
#   "missing_keywords": [
#     {{
#       "keyword": "string",
#       "importance": "low|medium|high"
#     }}
#   ]
# }}

# Resume:
# {resume}

# Job Description:
# {job_desc}
# """

    def _build_prompt(self, resume_text: str, job_description: str) -> str:
       return f"""
You are an unbiased AI resume analyzer. Your goal is to **strictly evaluate** how well a resume matches a job description and return a JSON score breakdown without skipping any suggestions.
Ignore irrelevant sections like "About the Company", "Benefits", or "Culture". Focus only on Responsibilities, Skills, and Qualifications.
Scoring Guide:
- Use ATS industry standards. A **score above 90** should mean a nearly perfect match.
- Deduct score if resume lacks **key technical skills**, **clear achievements**, or **quantified impact**.
- Deduct if resume lacks clarity, consistency, or formatting structure.
- Deduct for irrelevant sections or vague responsibilities.

ALWAYS return at least 3–5 meaningful suggestions — even if resume is strong.
- Suggestions should include:
  - Specific keyword improvements
  - Content gaps (e.g. missing metrics)
  - Format/structure improvements (section titles, bullet clarity)
- Use the provided schema strictly. DO NOT OMIT the suggestions array.

### Suggestions Policy:
- You MUST return at least **3 meaningful suggestions**, even for strong resumes.
- Suggestion types: "keyword", "content", "format", or "structure"
- Tips: Look for missing impact metrics, outdated formats, lack of keywords, weak project summaries.
- Only give suggestions if they are NOT already satisfied in the resume.
- Ensure suggestions directly reference the Job Description requirements and also ensure that missing keyword should actually missing from Job description provided by the user.


**Resume:**
\"\"\"
{resume_text}
\"\"\"

**Job Description:**
\"\"\"
{job_description}
\"\"\"

Respond in strict JSON with this schema:
{{
  "ats_score": <number 0–100>,
  "score_breakdown": {{
    "keywords": <number 0–100>,
    "similarity": <number 0–100>
  }},
  "matched_keywords": [
    {{
      "keyword": "<string>",
      "relevance": "<low|medium|high>"
    }}
  ],
  "missing_keywords": [
    {{
      "keyword": "<string>",
      "importance": "<low|medium|high>"
    }}
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
Make sure all fields follow this format exactly. Avoid extra text or comments.
Important:
- Include suggestions ALWAYS.
- Avoid markdown or commentary — output pure JSON.
"""



    def _parse_response(self, response: str) -> dict:
        import re
        import json

        # Remove leading/trailing text or markdown
        try:
            # Try parsing raw first
            return json.loads(response)
        except json.JSONDecodeError:
            pass

        # Try extracting JSON from code block or anywhere in text
        try:
            json_start = response.find("{")
            json_end = response.rfind("}")
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end + 1]
            return json.loads(json_str)
        except Exception as e:
            raise ValueError(f"Failed to parse LLM response: {e}")
    
        raise ValueError("Final fallback: Failed to extract JSON from model response.")
