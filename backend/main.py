from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.agent import run_ai_log_triage

app = FastAPI(title="AI Security Agent Triage API")

# Setup CORS so our Next.js frontend can communicate with our FastAPI server securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows development environments to poll the API routes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/api/triage")
def get_triage_analytics():
    """Fetches full automated log evaluation matrices."""
    return run_ai_log_triage()

@app.post("/api/chat")
def post_agent_chat(request: ChatRequest):
    """Processes interactive operational queries down into the simulator engine."""
    return run_ai_log_triage(user_query=request.message)