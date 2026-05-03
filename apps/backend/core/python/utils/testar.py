
from ultralytics import YOLO
import json
from pathlib import Path
from datetime import datetime
import cv2
import numpy as np

def testar(
    model_path: str,
    data_yaml: str,
    output_dir: str = None,
    conf_threshold: float = 0.25,
    device: str = 'cuda:0'
):
    """
    Testa modelo e salva inferências com overlay de segmentação e métricas.
    
    Args:
        model_path: Caminho para o modelo treinado (.pt)
        data_yaml: Caminho para o arquivo data.yaml
        output_dir: Diretório para salvar resultados (None = auto)
        conf_threshold: Threshold de confiança
        device: 'cuda:0' ou 'cpu'
    
    Returns:
        dict: Métricas do teste
    """
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    if output_dir is None:
        output_dir = f'runs/segment/test_{timestamp}'
    
    output_path = Path(output_dir)
    images_dir = output_path / 'images'
    images_dir.mkdir(parents=True, exist_ok=True)
    
    model = YOLO(model_path)
    
    metrics = model.val(data=str(Path(data_yaml).absolute()), device=device)
    
    import yaml
    with open(data_yaml, 'r') as f:
        data_config = yaml.safe_load(f)
    
    test_path_raw = data_config['test']
    if test_path_raw.startswith('../'):
        test_path_raw = test_path_raw[3:]  # remove '../'

    test_images_path = (Path(data_yaml).absolute().parent / test_path_raw).resolve()
    test_images = list(Path(test_images_path).glob('*.jpg')) + \
                  list(Path(test_images_path).glob('*.png')) + \
                  list(Path(test_images_path).glob('*.jpeg'))
    
    print(f"Running inference on {len(test_images)} test images...")

    print(f"\nDEBUG:")
    print(f"  data.yaml path: {Path(data_yaml).absolute()}")
    print(f"  test config value: {data_config['test']}")
    print(f"  test_images_path: {test_images_path}")
    print(f"  Path exists: {test_images_path.exists()}")
    print(f"  Files found: {len(test_images)}")
    
    for img_path in test_images:
        img = cv2.imread(str(img_path))
        results = model.predict(str(img_path), conf=conf_threshold, device=device, verbose=False)[0]
        
        overlay = img.copy()
        
        if results.masks is not None:
            masks = results.masks.data.cpu().numpy()
            boxes = results.boxes.data.cpu().numpy()
            
            for i, (mask, box) in enumerate(zip(masks, boxes)):
                mask_resized = cv2.resize(mask, (img.shape[1], img.shape[0]))
                mask_bool = mask_resized > 0.5
                
                color = np.random.randint(0, 255, 3).tolist()
                overlay[mask_bool] = overlay[mask_bool] * 0.5 + np.array(color) * 0.5
                
                x1, y1, x2, y2, conf, cls = box
                cv2.rectangle(overlay, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                cv2.putText(overlay, f'{conf:.2f}', (int(x1), int(y1)-5),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        metrics_text = [
            f"Box mAP@50: {metrics.box.map50:.3f}",
            f"Mask mAP@50: {metrics.seg.map50:.3f}",
            f"Detections: {len(results.boxes) if results.boxes is not None else 0}"
        ]
        
        box_height = 25 * len(metrics_text) + 10
        cv2.rectangle(overlay, (10, 10), (300, box_height), (0, 0, 0), -1)
        cv2.rectangle(overlay, (10, 10), (300, box_height), (255, 255, 255), 2)
        
        for i, text in enumerate(metrics_text):
            cv2.putText(overlay, text, (15, 30 + i*25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        output_file = images_dir / f"{img_path.stem}_result.jpg"
        cv2.imwrite(str(output_file), overlay)
    
    test_stats = {
        'timestamp': timestamp,
        'model_path': model_path,
        'data_yaml': data_yaml,
        'num_test_images': len(test_images),
        'metrics': {
            'box_map50': float(metrics.box.map50),
            'box_map50_95': float(metrics.box.map),
            'mask_map50': float(metrics.seg.map50),
            'mask_map50_95': float(metrics.seg.map),
            'box_precision': float(metrics.box.mp),
            'box_recall': float(metrics.box.mr),
            'mask_precision': float(metrics.seg.mp),
            'mask_recall': float(metrics.seg.mr)
        }
    }
    
    stats_file = output_path / 'test_stats.json'
    with open(stats_file, 'w') as f:
        json.dump(test_stats, f, indent=2)
    
    print(f"\nTest results saved to: {output_path}")
    print(f"Annotated images saved to: {images_dir}")
    print(f"Stats saved to: {stats_file}")
    print(f"\nBox mAP@50: {test_stats['metrics']['box_map50']:.4f}")
    print(f"Mask mAP@50: {test_stats['metrics']['mask_map50']:.4f}")
    
    return test_stats