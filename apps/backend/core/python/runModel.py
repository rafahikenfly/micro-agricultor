from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.post("/infer")
def runModel(data: dict):
    imagem_path = data["imagem"]
    model_path = data["model"]

    # TODO: rodar modelo real aqui
    resultado = {
        "labels": ["folha_saudavel"],
        "confianca": 0.95
    }

    return resultado

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)