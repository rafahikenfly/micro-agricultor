from fastapi import APIRouter
from services.runModel import runModel
import traceback

router = APIRouter(prefix="/infer")

@router.post("/")
def infer(data: dict):
    try:
        print("Payload recebido:", data)
        result = runModel(data)
        print("Resultado:", result)
        return result

    except Exception as e:
        traceback.print_exc()
        return {"err": str(e)}    