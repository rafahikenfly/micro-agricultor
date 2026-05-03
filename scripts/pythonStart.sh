#!/bin/bash

# Descobre o diretório onde o script está
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_DIR="$SCRIPT_DIR/../apps/backend/core/python"

# Ir para o diretório do backend Python
cd "$PYTHON_DIR" || exit 1

# SE NECESSARIO RECIAR O AMBIENTE, DESCOMNETAR
#python3 -m venv .venv

# SE NECESSARIO ATUALIZAR OS PACOTER, DESCOMENTAR
# source .venv/bin/activate
# pip install -r requirements.txt

# SE NECESSARIO ATUALIZAR PACOTES, DESCOMENTAR
# source .venv/bin/activate
# pip install -r requirements-ml.txt

# Subir o FastAPI com uvicorn
exec ./.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
