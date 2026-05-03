from utils import treinar
from utils import testar

# para treinar, ajuste os parâmetros abaixo e use
# python -m services.trainModel
# em backend/python

if __name__ == '__main__':
    b_dataset_path:str = 'data/datasets/folhas_01-05-26.yolov11/data.yaml'

    b_model, b_stats = treinar(
        data_yaml= b_dataset_path,
        model_name='data/models/yolov8n.pt', #'yolo11n.pt' 'yolov8n-seg.pt',
        epochs=10,
        batch_size=32,
        save_dir='data/models/leafDetector'
    )

    b_test_stats = testar(
        data_yaml=b_dataset_path,
        model_path=b_stats['paths']['best_weights']
    )