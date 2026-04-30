from fastapi import FastAPI
from routes.infer import router as infer_router
from routes.report import router as report_router

app = FastAPI()

app.include_router(infer_router)
app.include_router(report_router)