import uuid
import os

from utils import gerarPlot
import traceback

def runReport(data: dict):
    
    try:
        caracteristica_ids = data["caracteristica_ids"]
        entidade_ids = data["entidade_ids"]
        data_inicio = data.get("data_inicio")
        data_fim = data.get("data_fim")

        # gera nome único
        file_name = f"relatorio_{uuid.uuid4()}.png"
        output_path = os.path.join("/tmp", file_name)

        isPlotted = gerarPlot(
            caracteristica_ids=caracteristica_ids,
            entidade_ids=entidade_ids,
            data_inicio=data_inicio,
            data_fim=data_fim,
            output_path=output_path
        )


        if isPlotted:
            return output_path
        else:
            return False

    except Exception as e:
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }