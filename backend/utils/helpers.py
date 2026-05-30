import re

def calculate_engagement_rate(likes: int, comments: int, views: int) -> float:
    """
    Computes the engagement rate dynamically:
    engagement_rate = ((likes + comments) / views) * 100
    """
    if not views or views <= 0:
        return 0.0
    likes = likes or 0
    comments = comments or 0
    return round(((likes + comments) / views) * 100, 2)

def extract_youtube_id(url: str) -> str:
    """Extracts YouTube Video ID from various YouTube URL patterns."""
    if not url:
        return ""
    patterns = [
        r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([^&\s]+)',
        r'(?:https?://)?(?:www\.)?youtu\.be/([^\?\s]+)',
        r'(?:https?://)?(?:www\.)?youtube\.com/embed/([^\?\s]+)',
        r'(?:https?://)?(?:www\.)?youtube\.com/shorts/([^\?\s]+)'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    # Fallback search for any 11-char string that looks like a youtube id
    match = re.search(r'v=([^&\s]+)', url)
    if match:
        return match.group(1)
    return ""

def extract_instagram_id(url: str) -> str:
    """Extracts Instagram Reel or Post ID from standard Instagram URL patterns."""
    if not url:
        return ""
    patterns = [
        r'(?:https?://)?(?:www\.)?instagram\.com/reel/([^/\?\s]+)',
        r'(?:https?://)?(?:www\.)?instagram\.com/p/([^/\?\s]+)',
        r'(?:https?://)?(?:www\.)?instagram\.com/tv/([^/\?\s]+)'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return ""
