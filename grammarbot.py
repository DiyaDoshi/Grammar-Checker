from fastapi import FastAPI
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Gemini model
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.5)

class GrammarCheckRequest(BaseModel):
    text: str

# @app.api_route("/", methods=["POST"])
# async def grammar_check(data: GrammarCheckRequest):
#     print("📩 Received text for grammar check:", data.text)

@app.get("/")
async def root():
    return {"message": "Grammar API is running. Use POST / to check grammar."}

@app.post("/")
async def grammar_check(data: GrammarCheckRequest):
    print("📩 Received text for grammar check:", data.text)

    grammar_prompt = f"""
    Analyze the following text for grammar, spelling, and style issues. Format your response exactly as follows:

    First line: Complete corrected text
    Then for each error, provide:
    Original: [exact problematic text]
    Correction: [corrected version]
    Explanation: [brief explanation]

    Text: {data.text}
    """

    # Get the response from the Gemini model
    response = ""
    for chunk in llm.stream(grammar_prompt):
        if chunk.content:
            response += chunk.content

    print("🤖 Grammar Check Response:", response)
    return {"response": response if response else "No response generated."}

# Run FastAPI
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
