# app/services/file_handler.py
import os
import tempfile
from pathlib import Path
from typing import Optional
import PyPDF2
import docx
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx'}

async def save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file to temporary storage and return its path."""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")
    
    try:
        # Create temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            return temp_file.name
    except Exception as e:
        raise HTTPException(500, f"Error saving file: {str(e)}")

def extract_text_from_file(file_path: str) -> str:
    """Extract text from PDF or DOCX file."""
    try:
        print(f"\n=== DEBUG: Extracting text from {file_path} ===")
        
        if file_path.lower().endswith('.pdf'):
            print("Processing PDF file...")
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                print(f"Number of pages: {len(reader.pages)}")
                text_parts = []
                for i, page in enumerate(reader.pages):
                    page_text = page.extract_text() or ""
                    print(f"Page {i+1} text length: {len(page_text)} characters")
                    text_parts.append(page_text)
                text = '\n'.join(text_parts)
                print(f"Total extracted text length: {len(text)} characters")
                
        elif file_path.lower().endswith(('.doc', '.docx')):
            print("Processing DOCX file...")
            doc = docx.Document(file_path)
            paragraphs = [para.text for para in doc.paragraphs]
            print(f"Number of paragraphs: {len(paragraphs)}")
            text = '\n'.join(paragraphs)
            print(f"Extracted text length: {len(text)} characters")
            
        else:
            raise ValueError("Unsupported file format")
            
        if not text.strip():
            print("WARNING: Extracted text is empty!")
            
        return text.strip()
        
    except Exception as e:
        print(f"ERROR in extract_text_from_file: {str(e)}")
        raise HTTPException(500, f"Error extracting text: {str(e)}")