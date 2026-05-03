from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path
from datetime import datetime

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # vai pra /python
MODELS_DIR = BASE_DIR / "models"

def resolver_modelo(model_path: str) -> Path:
    return (MODELS_DIR / model_path).resolve()

def anotarInferencia(
    model_path: str,
    image_path: str,
    output_dir: str = None,
    conf_threshold: float = 0.25,
    device: str = 'cpu'
):
    """
    Roda inferência em uma única imagem, salva resultado anotado e retorna métricas.
    
    Args:
        model_path: Caminho para o modelo treinado (.pt)
        image_path: Caminho para a imagem a ser testada
        output_dir: Diretório para salvar resultados (None = auto)
        conf_threshold: Threshold de confiança
        device: 'cuda:0' ou 'cpu'
        
    Returns:
        dict: {"metrics": Métricas do teste para a imagem, "outputPath": caminho para imagem anotada}
    """

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    if output_dir is None:
        output_dir = f'runs/segment/single_test_{timestamp}'
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    model_path = resolver_modelo(model_path)
    model = YOLO(model_path)
    
    # Inferência e validação básica da imagem
    results = model.predict(image_path, conf=conf_threshold, device=device, verbose=False)[0]
    
    # Carrega a imagem para sobrepor máscaras e caixas
    img = cv2.imread(str(image_path))
    overlay = img.copy()

    # Desenha mascaras (se existirem)
    if results.masks is not None:
        masks = results.masks.data.cpu().numpy()
        boxes = results.boxes.data.cpu().numpy()
        
        for mask, box in zip(masks, boxes):
            mask_resized = cv2.resize(mask, (img.shape[1], img.shape[0]))
            mask_bool = mask_resized > 0.5
            
            color = np.random.randint(0, 255, 3).tolist()
            overlay[mask_bool] = overlay[mask_bool] * 0.5 + np.array(color) * 0.5
            
            x1, y1, x2, y2, conf, cls = box
            cv2.rectangle(overlay, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            cv2.putText(overlay, f'{conf:.2f}', (int(x1), int(y1)-5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    
    # Desenha bounding box (independente da máscara)
    if results.boxes is not None:
        boxes = results.boxes.data.cpu().numpy()

        for box in boxes:
            x1, y1, x2, y2, conf, cls = box
            color = np.random.randint(0, 255, 3).tolist()

            cv2.rectangle(overlay, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            cv2.putText(
                overlay,
                f'{conf:.2f}',
                (int(x1), int(y1)-5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                2
            )
        
    # Calcula Métricas básicas da predição
    metrics = {
        'detections': len(results.boxes) if results.boxes is not None else 0,
        'confidence_threshold': conf_threshold
    }

    # Calcula Métricas de classes da predição
    detections = {}
    confidence_sum_per_class = {}
    confidence_avg_per_class = {}

    if results.boxes is not None:
        boxes = results.boxes.data.cpu().numpy()
        class_names = results.names # nomes das classes (vem do modelo)

        for box in boxes:
            x1, y1, x2, y2, conf, cls = box
            cls_id = int(cls)
            class_name = class_names[cls_id]

            if class_name not in detections:
                detections[class_name] = {
                    "count": 0,
                    "confidence_sum": 0
                }

            # Contagem de detecções
            detections[class_name]["count"] += 1
            detections[class_name]["confidence_sum"] += conf

        # Calcular média e limpar estrutura
        for class_name, data in detections.items():
            count = data["count"]
            data["confidence"] = data["confidence_sum"] / count if count > 0 else 0
            del data["confidence_sum"]
        
        # Salvar a imagem anotada
        output_file = output_path / f"{Path(image_path).stem}_anotado.jpg"
        cv2.imwrite(str(output_file), overlay)
        
    return { "metrics": metrics, "outputPath": output_file, "detections": detections}
