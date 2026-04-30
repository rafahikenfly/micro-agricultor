import sqlite3
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
from collections import defaultdict
from typing import List, Optional


def gerarPlot(
    caracteristica_ids: List[str],
    entidade_ids: List[str],
    data_inicio = None,
    data_fim = None,
    output_path: str = "plot.png"
):
    
    base_dir = Path(__file__).resolve().parent
    db_path = (base_dir.parents[1] / "sensores.db").resolve()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Monta placeholders (?, ?, ?)
    cid_placeholders = ",".join(["?"] * len(caracteristica_ids))
    eid_placeholders = ",".join(["?"] * len(entidade_ids))

    query = f"""
        SELECT data_hora, valor, caracteristica_id, entidade_id
        FROM sensores_log
        WHERE caracteristica_id IN ({cid_placeholders})
          AND entidade_id IN ({eid_placeholders})
    """

    params = caracteristica_ids + entidade_ids

    # Filtro de data opcional
    if data_inicio is not None:
        query += " AND data_hora >= ?"
        params.append(data_inicio)

    if data_fim is not None:
        query += " AND data_hora <= ?"
        params.append(data_fim)

    query += " ORDER BY data_hora"

    cursor.execute(query, params)
    dados = cursor.fetchall()

    conn.close()

    if not dados:
        return False

    # Agrupar por (caracteristica_id, entidade_id)
    grupos = defaultdict(list)

    for data, valor, cid, eid in dados:
        grupos[(cid, eid)].append((data, valor))

    # Plotar
    plt.figure(figsize=(10, 6))

    for (cid, eid), pontos in grupos.items():
        datas = [p[0] for p in pontos]
        valores = [p[1] for p in pontos]

        label = f"CID {cid} - ENT {eid}"
        plt.plot(datas, valores, label=label)

    plt.xlabel("Data")
    plt.ylabel("Valor")
    plt.title("Sensores por característica e entidade")
    plt.xticks(rotation=45)
    plt.legend()

    plt.tight_layout()

    # Salvar imagem
    plt.savefig(output_path, dpi=300)

    # Opcional (comente se estiver rodando sem interface gráfica)
    plt.show()

    plt.close()

    return True