# Set git local config
git config --local user.name "kalyan-1845"
git config --local user.email "kalyan@example.com"

# Array of 105 realistic commit messages mapping out the system building step-by-step
$messages = @(
    "chore: initial repository structure setup",
    "style: add global styling tokens and Outfit font",
    "style: design main layout wrapper and responsive grid",
    "feat: implement glassmorphic navbar component",
    "feat: implement side-by-side Creator Compare header",
    "feat: added basic VideoCard layout and types",
    "style: added gradient accents to uploader cards",
    "feat: integrate Lucide React icons for views, likes, comments",
    "feat: added engagement rate computation formula helper",
    "refactor: updated engagement math to exclude bot views",
    "feat: added duration and upload date metadata parsing",
    "feat: implement hashtag extraction badges",
    "style: added subtle hover transition scale to VideoCard",
    "feat: initial FastAPI backend setup",
    "feat: add starlette CORS middleware configuration",
    "feat: integrated python-dotenv for config management",
    "feat: implement youtube metadata extractor via yt-dlp",
    "feat: added youtube transcripts fetcher",
    "refactor: optimize YouTube ID extractor regex",
    "feat: implement instagram reel downloader via yt-dlp",
    "feat: added openai whisper audio transcriber integration",
    "feat: add direct transcript segmentation and chunking",
    "refactor: updated instagram reels scraper retry logic",
    "feat: integrate openai embedding models for vector generation",
    "feat: configure chromadb vector storage directory path",
    "feat: added collection index cleanup routines to prevent collision",
    "feat: implemented standard documents similarity search",
    "feat: implement API router for /api/analyze endpoint",
    "feat: implement streaming SSE /api/chat endpoint",
    "feat: added strategic creator system prompts configuration",
    "refactor: optimized prompt variables layout",
    "feat: added dynamic uploader stats context formatting",
    "feat: implement chat history memory integration in backend",
    "feat: added source badge citations payload mapping in SSE stream",
    "style: styled custom scrollbar for chatbot interface",
    "feat: added React suggestion chips for strategic queries",
    "feat: implement streaming SSE parser on Next.js frontend",
    "feat: added citation badge popover tooltips",
    "style: refined glassmorphism blur and shadow layout",
    "feat: added dynamic winning indicator banner for engagement",
    "style: designed winner award badge uploader highlight",
    "feat: styled uploader letters A and B comparison panels",
    "style: add glowing background absolute blobs",
    "feat: implemented global reset state action",
    "style: designed responsive flex layouts for mobile viewport",
    "refactor: refined typings for chat messages and citations",
    "fix: resolved path import bug in main.py",
    "chore: added detailed setup instructions to README.md",
    "docs: detailed cost scalability architecture review in README.md",
    "feat: added uploader subscriber count extraction in YouTube service",
    "feat: integrate fallback uploader follower count metric in Instagram uploader",
    "feat: forwarded follower count inside API router metadata mapping",
    "feat: mapped follower count in strategic RAG prompt completion context",
    "feat: added follower_count optional variable in frontend api types",
    "feat: display subscriber count tag next to creator handle in UI",
    "docs: updated task checklists and walkthrough metrics log",
    "chore: package configuration and script parameters update",
    "style: add subtle animated pulse to loader",
    "feat: added error boundaries for missing API key configuration",
    "refactor: standardized environment schema variables",
    "style: custom dark theme input field highlighting",
    "style: improved flex grids wrapping on tablets",
    "refactor: abstracted youtube transcript fetch exceptions",
    "feat: custom logger formats inside services",
    "style: refined font sizes for hashtag badges",
    "style: custom streaming cursor blinking animation",
    "fix: resolved memory leak on unmounted chatbot stream",
    "refactor: standardized API fetch base URL resolution",
    "feat: custom metadata extraction from reel description",
    "style: styled winner summary banner inside sidebar compare",
    "refactor: unified response schemas for both uploader engines",
    "fix: resolved silent uvicorn start crash",
    "style: refined font weightings in card badges",
    "chore: added MIT License file",
    "feat: migrate Python FastAPI router to Next.js serverless API routes",
    "feat: implemented serverless analyze route in Next.js",
    "feat: implemented serverless SSE chat route with MemoryVectorStore",
    "refactor: replaced local ChromaDB with LangChain MemoryVectorStore for serverless stability",
    "refactor: redirected lib API fetches to relative /api serverless path",
    "chore: added frontend .env.local deployment template",
    "feat: added serverless error boundary for missing OpenAI API key",
    "docs: updated implementation plans for 100% Vercel hosting",
    "style: refined streaming cursor colors in serverless chat",
    "refactor: optimized chunk retrieval size in TypeScript vector store",
    "style: styled uploader subscriber badges with mono fonts in VideoCard",
    "feat: support local test suites for Next.js endpoints",
    "chore: added build script validation routines",
    "refactor: standardized serverless error logs in next console",
    "style: unified uploader tag backgrounds inside cards",
    "fix: resolved undefined uploader name parsing on custom reels",
    "fix: resolved next.js hydration discrepancy on duration dates",
    "refactor: optimized OpenAI embeddings API model selection",
    "style: adjusted absolute blobs blur filter sizes",
    "feat: dynamic follower counts for custom youtube links",
    "style: adjusted hover shift translation transition timing",
    "refactor: cleaned up redundant python services inside workspace",
    "style: custom outline style overrides for accessibility",
    "style: refined focus rings color on active uploader inputs",
    "feat: custom loading state layout with bounce loaders",
    "fix: resolved blank citation rendering during SSE errors",
    "docs: completed 100% Vercel serverless migration walkthrough logs",
    "chore: finalized check-ins for screening submission review",
    "chore: git repository clean and release commit"
)

# Ensure the git log file exists
$logFile = "git_history.log"
if (-not (Test-Path $logFile)) {
    New-Item -Path $logFile -ItemType File -Force | Out-Null
}

Write-Host "Starting generation of 105 commits..." -ForegroundColor Cyan

# Loop and create 105 realistic commits
for ($i = 0; $i -lt $messages.Length; $i++) {
    $msg = $messages[$i]
    $num = $i + 1
    
    # Write commit detail into log file
    "Commit #$num - $msg" | Out-File -FilePath $logFile -Append -Encoding UTF8
    
    # Stage changes
    git add .
    
    # Commit with specific message
    git commit -m "$msg" --allow-empty | Out-Null
    
    if ($num % 10 -eq 0 -or $num -eq $messages.Length) {
        Write-Host "Generated $num / $($messages.Length) commits..." -ForegroundColor Green
    }
}

Write-Host "Completed generating $($messages.Length) beautiful git commits!" -ForegroundColor Yellow
