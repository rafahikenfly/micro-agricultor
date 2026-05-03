#!/bin/bash

REPO_DIR="/home/cyberlavrador2/micro-agricultor"

echo "[$(date)] Buscando atualizações do backend..."

cd $REPO_DIR || exit 1

git fetch origin main || {
  echo "Erro no git fetch"
  exit 1
}

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "Atualização disponível. Atualizando..."
  git reset --hard origin/main
  echo "Reiniciando serviços..."

  sudo systemctl restart node-backend || exit 1
  sudo systemctl restart fastapi || exit 1

  echo "Deploy concluído!"
else
  echo "Nenhuma atualização."
fi