from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import logging
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("gen-server")

MODEL_ID = os.environ.get("MODEL_ID", "google/gemma-3-1b-it")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = FastAPI(title="Gen API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],  # your Next dev origin
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

class GenRequest(BaseModel):
    answers: dict
    max_new_tokens: int = 120
    temperature: float = 0.2

log.info(f"Loading tokenizer/model {MODEL_ID} to {DEVICE} ...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(MODEL_ID)
model.to(DEVICE)
model.eval()
log.info("Model loaded")

def build_prompt_from_answers(answers: dict) -> str:
    # concise prompt - you can customize formatting
    content = "User survey answers (JSON):\n" + str(answers) + "\n\nTask: Give a short friendly summary (3 sentences) and 2 personalized suggestions."
    return content

@app.post("/generate")
async def generate(req: GenRequest):
    if not req.answers:
        raise HTTPException(status_code=400, detail="answers required")

    prompt = build_prompt_from_answers(req.answers)

    # prefer tokenizer.apply_chat_template if available; fallback otherwise
    try:
        inputs = tokenizer.apply_chat_template(
            [{"role":"user","content":prompt}],
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(DEVICE)
    except Exception:
        inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)

    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=req.max_new_tokens, temperature=req.temperature)
    input_len = inputs["input_ids"].shape[-1]
    decoded = tokenizer.decode(outputs[0][input_len:], skip_special_tokens=True)
    return {"reply": decoded}

