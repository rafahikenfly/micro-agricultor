from fastapi import APIRouter
from services.runModel import runModel

router = APIRouter(prefix="/infer")

@router.post("/")
def infer(data: dict):
    return runModel(data)