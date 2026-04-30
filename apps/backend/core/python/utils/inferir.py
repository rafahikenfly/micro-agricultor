from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path
from datetime import datetime

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
        dict: Métricas do teste para a imagem
    """

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    if output_dir is None:
        output_dir = f'runs/segment/single_test_{timestamp}'
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    model = YOLO(model_path)
    
    # Inferência e validação básica da imagem
    results = model.predict(image_path, conf=conf_threshold, device=device, verbose=False)[0]
    
    # Carrega a imagem para sobrepor máscaras e caixas
    img = cv2.imread(str(image_path))
    overlay = img.copy()
    
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
    
    # Métricas básicas da predição
    metrics = {
        'detections': len(results.boxes) if results.boxes is not None else 0,
        'confidence_threshold': conf_threshold
    }
    
    # Salvar a imagem anotada
    output_file = output_path / f"{Path(image_path).stem}_result.jpg"
    cv2.imwrite(str(output_file), overlay)
    
    print(f"Imagem anotada salva em: {output_file}")
    print(f"Métricas: {metrics}")
    
    return metrics
