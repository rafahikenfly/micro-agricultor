from ultralytics import YOLO
import json
from pathlib import Path
from datetime import datetime
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import shutil

# com a versão atual do ultralytics, o yolo11 não funciona
# TODO: atualizar o ultralytics para usar modelos mais modernos
# atualizar os requirements-ml depois

def treinar(
    data_yaml: str,
    model_name: str = 'yolov8n-seg.pt',
    epochs: int = 10,
    img_size: int = 640,
    batch_size: int = 16,
    device: str = 'cuda:0',
    patience: int = 50,
    save_dir: str = None
):
    """
    Treina YOLOv8 instance segmentation e salva estatísticas.
    
    Args:
        data_yaml: Caminho para o arquivo data.yaml
        model_name: Modelo base (yolov8n/s/m/l/x-seg.pt)
        epochs: Número de épocas
        img_size: Tamanho da imagem
        batch_size: Tamanho do batch
        device: 'cuda:0' ou 'cpu'
        patience: Early stopping patience
        save_dir: Diretório customizado para salvar (None = auto)
    
    Returns:
        tuple: (model, stats_dict)
    """
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    run_name = save_dir if save_dir else f'train_{timestamp}'
    
    model = YOLO(model_name)
    
    model.train(
        data=str(Path(data_yaml).absolute()),
        epochs=epochs,
        imgsz=img_size,
        batch=batch_size,
        name=run_name,
        patience=patience,
        save=True,
        device="cpu",
        verbose=True,
        plots=True
    )
    
    metrics = model.val()
    
    stats_dir = Path(model.trainer.save_dir) / 'stats'
    stats_images_dir = stats_dir / 'images'
    stats_dir.mkdir(exist_ok=True)
    stats_images_dir.mkdir(exist_ok=True)
    
    results_csv = Path(model.trainer.save_dir) / 'results.csv'
    if results_csv.exists():
        df = pd.read_csv(results_csv)
        df.columns = df.columns.str.strip()
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('Training Metrics', fontsize=16)
        
        axes[0, 0].plot(df['epoch'], df['metrics/mAP50(B)'], label='Box mAP50', marker='o')
        axes[0, 0].plot(df['epoch'], df['metrics/mAP50(M)'], label='Mask mAP50', marker='s')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('mAP@50')
        axes[0, 0].set_title('mAP@50 (Box vs Mask)')
        axes[0, 0].legend()
        axes[0, 0].grid(True)
        
        axes[0, 1].plot(df['epoch'], df['metrics/mAP50-95(B)'], label='Box mAP50-95', marker='o')
        axes[0, 1].plot(df['epoch'], df['metrics/mAP50-95(M)'], label='Mask mAP50-95', marker='s')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('mAP@50-95')
        axes[0, 1].set_title('mAP@50-95 (Box vs Mask)')
        axes[0, 1].legend()
        axes[0, 1].grid(True)
        
        axes[1, 0].plot(df['epoch'], df['train/box_loss'], label='Box Loss', marker='o')
        axes[1, 0].plot(df['epoch'], df['train/seg_loss'], label='Seg Loss', marker='s')
        axes[1, 0].plot(df['epoch'], df['train/cls_loss'], label='Cls Loss', marker='^')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('Loss')
        axes[1, 0].set_title('Training Losses')
        axes[1, 0].legend()
        axes[1, 0].grid(True)
        
        axes[1, 1].plot(df['epoch'], df['metrics/precision(B)'], label='Box Precision', marker='o')
        axes[1, 1].plot(df['epoch'], df['metrics/recall(B)'], label='Box Recall', marker='s')
        axes[1, 1].set_xlabel('Epoch')
        axes[1, 1].set_ylabel('Score')
        axes[1, 1].set_title('Precision & Recall')
        axes[1, 1].legend()
        axes[1, 1].grid(True)
        
        plt.tight_layout()
        plt.savefig(stats_images_dir / 'training_curves.png', dpi=150, bbox_inches='tight')
        plt.close()
        
        existing_plots = list(Path(model.trainer.save_dir).glob('*.png'))
        for plot in existing_plots:
            if plot.name not in ['training_curves.png']:
                shutil.copy(plot, stats_images_dir / plot.name)
    
    stats = {
        'training_info': {
            'timestamp': timestamp,
            'model': model_name,
            'epochs': epochs,
            'img_size': img_size,
            'batch_size': batch_size,
            'dataset': data_yaml,
            'device': device
        },
        'metrics': {
            'box_map50': float(metrics.box.map50),
            'box_map50_95': float(metrics.box.map),
            'mask_map50': float(metrics.seg.map50),
            'mask_map50_95': float(metrics.seg.map),
            'box_precision': float(metrics.box.mp),
            'box_recall': float(metrics.box.mr),
            'mask_precision': float(metrics.seg.mp),
            'mask_recall': float(metrics.seg.mr)
        },
        'paths': {
            'results_dir': str(model.trainer.save_dir),
            'best_weights': str(model.trainer.save_dir / 'weights' / 'best.pt'),
            'last_weights': str(model.trainer.save_dir / 'weights' / 'last.pt')
        }
    }
    
    stats_file = Path(model.trainer.save_dir) / 'training_stats.json'
    with open(stats_file, 'w') as f:
        json.dump(stats, f, indent=2)
    
    print(f"\nResults saved to: {model.trainer.save_dir}")
    print(f"Stats saved to: {stats_file}")
    print(f"\nBox mAP@50: {stats['metrics']['box_map50']:.4f}")
    print(f"Mask mAP@50: {stats['metrics']['mask_map50']:.4f}")
    
    return model, stats
