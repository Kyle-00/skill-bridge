"""
Transparent matching: explains exactly WHY something matched.
No fake 'AI' — weighted skill overlap + keyword relevance + recency,
which is honest, fast, and demonstrable.
"""
import re
from datetime import timedelta
from django.utils import timezone

STOPWORDS = {
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has',
    'have', 'i', 'in', 'is', 'it', 'looking', 'need', 'needed', 'of', 'on',
    'or', 'our', 'the', 'to', 'we', 'who', 'will', 'with', 'you', 'your',
    'us', 'can', 'that', 'this', 'was', 'were', 'their', 'them', 'they',
}

TOKEN_RE = re.compile(r'[a-z0-9+#.\-]{2,}')


def tokenize(text):
    return {
        t for t in TOKEN_RE.findall((text or '').lower())
        if t not in STOPWORDS
    }


def _profile_skills(user):
    profile = getattr(user, 'freelancer_profile', None)
    return [s.strip() for s in (profile.skills if profile and profile.skills else []) if s.strip()]


def score_project_for_freelancer(project, user):
    """Return (score 0-100, reasons list)."""
    skills = _profile_skills(user)
    if not skills:
        return 0, ['Add skills to your profile to get matched']

    haystack = f'{project.title} {project.description}'.lower()
    skill_tokens = set()
    for s in skills:
        skill_tokens |= tokenize(s)

    matched_skills = [s for s in skills if s.lower() in haystack]
    text_tokens = tokenize(haystack)
    overlap = len(text_tokens & skill_tokens) / max(1, len(skill_tokens))

    skill_score = 45 * min(1.0, len(matched_skills) / 3)
    keyword_score = 35 * min(1.0, overlap * 2)
    category_score = 10 if any(
        tokenize(project.category) & tokenize(s) for s in skills
    ) or tokenize(project.category) <= skill_tokens else 5
    recency_score = 10 if project.created_at >= timezone.now() - timedelta(days=7) else 5

    score = round(skill_score + keyword_score + category_score + recency_score)

    reasons = [f'Skill match: {s}' for s in matched_skills[:3]]
    return min(100, score), reasons


def score_freelancer_for_project(project, freelancer):
    """Return (score 0-100, reasons list) for a client's project."""
    skills = _profile_skills(freelancer)
    haystack = f'{project.title} {project.description}'.lower()

    matched_skills = [s for s in skills if s.lower() in haystack]
    overlap = len(tokenize(haystack) & {t for s in skills for t in tokenize(s)}) / max(1, len(skills))
    profile = getattr(freelancer, 'freelancer_profile', None)
    title_overlap = len(tokenize(haystack) & tokenize(profile.title if profile else ''))

    score = round(
        50 * min(1.0, len(matched_skills) / 3)
        + 30 * min(1.0, overlap * 2)
        + 10 * min(1.0, title_overlap / 2)
        + min(10, freelancer.trust_score / 10)
    )
    reasons = [f'Matches: {s}' for s in matched_skills[:3]]
    if profile and profile.availability:
        reasons.append('Available now')
    return min(100, score), reasons