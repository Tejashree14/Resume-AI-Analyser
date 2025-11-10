import re
from typing import List, Dict, Tuple
import spacy
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ResumeAnalyzer:
    def __init__(self):
        # self.nlp = spacy.load("en_core_web_sm")
        try:
            self.nlp = spacy.load("en_core_web_sm")
        
        except OSError:
            raise RuntimeError("Spacy model not found. Please run 'python -m spacy download en_core_web_sm' to download the model.")
            

    def preprocess_text(self, text: str) -> str:
        """Basic text preprocessing """
        text = text.lower()
        # test = re.sub(r'[^a-zA-Z\s]', '', text)
        text = re.sub(r'[^a-zA-Z\s]', '', text)

        return ' '.join(text.split())

    def extract_keywords(self, text: str, top_n: int = 20) -> List[str]:
        """Extract top keywords from text using TF-IDF."""
        words = [token.lemma_ for token in self.nlp(text) 
                if not token.is_stop and not token.is_punct and token.is_alpha]
        word_freq = Counter(words)
        return [word for word, _ in word_freq.most_common(top_n)]

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts."""
        vectorizer = TfidfVectorizer().fit_transform([text1, text2])
        return cosine_similarity(vectorizer[0:1], vectorizer[1:2])[0][0]

    def analyze_resume(self, resume_text: str, job_description: str) -> dict:
        """Analyze resume against job description."""
        print("\n=== DEBUG: Starting resume analysis ===")
        print(f"Resume text length: {len(resume_text)} characters")
        print(f"Job description length: {len(job_description)} characters")
        
        # Preprocess texts
        clean_resume = self.preprocess_text(resume_text)
        clean_jd = self.preprocess_text(job_description)
        
        print(f"Cleaned resume length: {len(clean_resume)} characters")
        print(f"Cleaned JD length: {len(clean_jd)} characters")
        
        # Extract keywords
        resume_keywords = set(self.extract_keywords(clean_resume))
        jd_keywords = set(self.extract_keywords(clean_jd))
        
        print(f"\nResume keywords ({len(resume_keywords)}):", list(resume_keywords)[:10], "...")
        print(f"JD keywords ({len(jd_keywords)}):", list(jd_keywords)[:10], "...")
        
        # Calculate matches
        matched_keywords = list(resume_keywords.intersection(jd_keywords))
        missing_keywords = list(jd_keywords - resume_keywords)
        
        print(f"\nMatched keywords ({len(matched_keywords)}):", matched_keywords[:5], "...")
        print(f"Missing keywords ({len(missing_keywords)}):", missing_keywords[:5], "...")
        
        # Calculate ATS score (simplified)
        similarity_score = self.calculate_similarity(clean_resume, clean_jd)
        ats_score = int(similarity_score * 100)
        
        print(f"\nSimilarity score: {similarity_score}")
        print(f"ATS Score: {ats_score}")
        
        # Generate suggestions
        suggestions = self._generate_suggestions(missing_keywords, resume_text)
        
        # Convert matched_keywords to list of dicts with 'keyword' and 'relevance' fields
        matched_keywords_list = [{'keyword': kw, 'relevance': 'high'} for kw in matched_keywords]
        
        result = {
            'ats_score': ats_score,
            'score_breakdown': {
                'keywords': len(matched_keywords) / max(1, len(jd_keywords)) * 100,
                'similarity': ats_score
            },
            'matched_keywords': matched_keywords_list,  # Now a list of dicts
            'missing_keywords': [{'keyword': kw, 'importance': 'high'} for kw in missing_keywords],
            'suggestions': suggestions
        }
        
        print("\nFinal result:", result)
        print("=== DEBUG: End of analysis ===\n")
        
        return result

    def _generate_suggestions(self, missing_keywords: List[str], resume_text: str) -> List[dict]:
        """Generate improvement suggestions."""
        suggestions = []
        
        # Add missing keywords suggestion
        if missing_keywords:
            suggestions.append({
                'type': 'keyword',
                'title': 'Add missing keywords',
                'description': f"Consider adding these relevant keywords: {', '.join(missing_keywords[:5])}",
                'priority': 'high',
                'section': 'Skills/Experience'
            })
        
        # Add other suggestions based on analysis
        doc = self.nlp(resume_text)
        
        # Check for action verbs
        action_verbs = [token.text for token in doc if token.pos_ == 'VERB' and token.dep_ in ('ROOT', 'acl')]
        if len(action_verbs) < 5:
            suggestions.append({
                'type': 'content',
                'title': 'Add more action verbs',
                'description': 'Use more action verbs to start your bullet points (e.g., developed, designed, implemented)',
                'priority': 'medium',
                'section': 'Experience'
            })
            
        return suggestions
