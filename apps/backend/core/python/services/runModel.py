from utils import anotarInferencia

def runModel(data: dict):
    image_path = data.get("imagePath", None)
    model_path = data.get("modelPath", None)
    conf_threshold = data.get("confidence", 0.25)

    if not image_path:
        return {"err": "Sem caminho de imagem"}
    if not model_path:
        return {"err": "Sem caminho de modelo"}

    resultado = anotarInferencia(
        image_path=image_path,
        model_path=model_path,
        conf_threshold=conf_threshold,
        output_dir='data/resultados' #TODO ARRUMAR O OUTPUT_DIR
    )

    return resultado