import re
from typing import Dict, Set

SKILL_ALIASES: Dict[str, Set[str]] = {
    'react': {'react', 'react.js', 'reactjs', 'react-js'},
    'angular': {'angular', 'angularjs', 'angular.js'},
    'vue': {'vue', 'vue.js', 'vuejs'},
    'node': {'node', 'node.js', 'nodejs', 'node-js'},
    'python': {'python', 'python3', 'py'},
    'javascript': {'javascript', 'js', 'ecmascript'},
    'typescript': {'typescript', 'ts'},
    'java': {'java', 'j2se', 'j2ee'},
    'csharp': {'c#', 'csharp', 'c sharp'},
    'cpp': {'c++', 'cpp', 'c plus plus'},
    'ml': {'machine learning', 'ml', 'machinelearning'},
    'dl': {'deep learning', 'dl', 'deeplearning', 'neural networks'},
    'ai': {'artificial intelligence', 'ai', 'ai/ml'},
    'aws': {'aws', 'amazon web services', 'amazon ws'},
    'gcp': {'gcp', 'google cloud', 'google cloud platform'},
    'azure': {'azure', 'microsoft azure'},
    'sql': {'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mssql'},
    'nosql': {'nosql', 'mongodb', 'cassandra', 'dynamodb', 'redis'},
    'docker': {'docker', 'docker-container', 'containerization'},
    'kubernetes': {'kubernetes', 'k8s', 'kubes'},
    'git': {'git', 'github', 'gitlab', 'version control'},
    'web': {'web development', 'web', 'full stack', 'fullstack'},
    'frontend': {'frontend', 'front-end', 'front end', 'ui'},
    'backend': {'backend', 'back-end', 'back end', 'server'},
    'devops': {'devops', 'ci/cd', 'cicd', 'sre'},
    'data': {'data science', 'data analysis', 'analytics'},
}

def normalize_skill(skill: str) -> str:
    """Normalizes a skill name to its canonical form."""
    if not skill:
        return ""
    skill = skill.lower().strip()
    skill = re.sub(r'[._\-]', ' ', skill)
    skill = re.sub(r'\s+', ' ', skill)
    
    # Try to find the canonical name from aliases
    for canonical, aliases in SKILL_ALIASES.items():
        if skill in aliases or skill == canonical:
            return canonical
    return skill

def get_normalized_skill_list(skills_string: str) -> str:
    """Takes a comma-separated string, normalizes each skill, deduplicates, and returns a clean string."""
    if not skills_string:
        return ""
    skills = [s.strip() for s in skills_string.split(',') if s.strip()]
    normalized = set(normalize_skill(s) for s in skills if s)
    return ", ".join(sorted(list(normalized)))
