from utils import anotarInferencia

def runModel(data: dict):
    image_path = data["imagem"]
    model_path = data["model"]
    conf_threshold = data.get("confidence", 0.25)

    resultado = anotarInferencia(
        image_path=image_path,
        model_path=model_path,
        conf_threshold=conf_threshold,
        output_dir='data/resultados' #TODO ARRUMAR O OUTPUT_DIR
    )

    return resultado