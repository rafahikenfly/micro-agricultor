from fastapi import APIRouter
from services.runReport import runReport

router = APIRouter(prefix="/report")

@router.post("/")
def report(data: dict):
    return runReport(data)