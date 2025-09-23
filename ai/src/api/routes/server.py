from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from sentence_transformers import CrossEncoder

router = APIRouter()

# Hugging Face에서 미리 학습된 Cross-Encoder 모델 사용
model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-12-v2")  

class Candidate(BaseModel):
    termId: int
    answer: str

class CompareRequest(BaseModel):
    question: str
    candidateList: List[Candidate]

@router.post("/compare")
def compare(req: CompareRequest):
    question = req.question
    candidates = req.candidateList

    if not candidates:  # 후보가 없으면 바로 반환
        return {"results": []}
    
    # 각 candidate.answer와 question 점수 계산
    scores = model.predict([(question, c.answer) for c in candidates])

    # score와 candidate 객체를 튜플로 묶고 내림차순 정렬
    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    # 유사도가 5 이상인 것만 필터링
    filtered = [(c, s) for c, s in ranked if s >= 6]

    # 상위 3개만 추출
    top3 = filtered[:3]
    # 결과 반환 (termId, answer, score 포함)
    result = [{"termId": c.termId, "answer": c.answer, "score": float(s)} for c, s in top3]
    return {"results": result}

