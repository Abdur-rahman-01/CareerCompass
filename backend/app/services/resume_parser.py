import io
import os
import json
from typing import Dict, Any, List, Optional
from pdfminer.high_level import extract_text as extract_pdf_text
import docx
from litellm import completion

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extracts raw text from PDF or DOCX files."""
    try:
        if filename.lower().endswith('.pdf'):
            fp = io.BytesIO(file_content)
            return extract_pdf_text(fp)
        elif filename.lower().endswith('.docx'):
            fp = io.BytesIO(file_content)
            doc = docx.Document(fp)
            return "\n".join([p.text for p in doc.paragraphs])
        else:
            return ""
    except Exception as e:
        print(f"Extraction Error: {e}")
        return ""

async def parse_resume_with_ai(text: str) -> Dict[str, Any]:
    """Uses Gemini to parse unstructured resume text into a structured JSON profile."""
    if not text.strip():
        return {}

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        return {}

    prompt = f"""
    You are an expert Resume Parser. Analyze the following resume text and extract structured information.
    
    Resume Text:
    ---
    {text}
    ---
    
    Extract the following fields and return as a JSON object ONLY:
    - full_name: The person's full name.
    - email: Email address.
    - branch: The student's major or field of study (e.g., Computer Science).
    - year: Year of study as an integer (1-4).
    - cgpa: Current CGPA as a float (e.g., 8.5).
    - skills: A list of technical skills found (e.g., ["Python", "React"]).
    - goals: A summary of career objectives or interests.
    - experience: A list of key professional experiences or projects.
    - education: A list of educational qualifications.
    
    Format example:
    {{
      "full_name": "...",
      "email": "...",
      "branch": "...",
      "year": 3,
      "cgpa": 8.5,
      "skills": ["...", "..."],
      "goals": "...",
      "experience": ["...", "..."],
      "education": ["...", "..."]
    }}
    
    If any field is missing, use null or an empty list/string.
    Return ONLY JSON.
    """

    try:
        # Added num_retries to handle transient 429/500 errors from the API
        response = completion(
            model="gemini/gemini-2.0-flash",
            messages=[{"role": "user", "content": prompt}],
            api_key=api_key,
            response_format={ "type": "json_object" },
            num_retries=3
        )
        
        content = response.choices[0].message.content
        if not content:
            print("AI Warning: Received empty content from Gemini")
            return {}

        # Clean potential markdown backticks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        else:
            content = content.strip()
            
        return json.loads(content)
    except Exception as e:
        # Log specific error details to help with debugging
        error_type = type(e).__name__
        print(f"AI Parsing Error [{error_type}]: {e}")
        
        # If it's a quota issue on 2.0-flash, try falling back to 1.5-flash
        if "429" in str(e) or "quota" in str(e).lower():
            print("Quota Exceeded on gemini-2.0-flash. Attempting fallback to gemini-1.5-flash...")
            try:
                response = completion(
                    model="gemini/gemini-1.5-flash",
                    messages=[{"role": "user", "content": prompt}],
                    api_key=api_key,
                    response_format={ "type": "json_object" },
                    num_retries=2
                )
                
                content = response.choices[0].message.content
                if not content:
                    return {}

                # Clean potential markdown backticks
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                else:
                    content = content.strip()
                    
                return json.loads(content)
            except Exception as fallback_e:
                print(f"Fallback model also failed: {fallback_e}")
                return {"error": "QUOTA_EXCEEDED", "message": "All AI models are currently at peak capacity. Please try again in 60 seconds."}
            
        return {}

