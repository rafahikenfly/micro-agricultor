#remover virtual environment anterior
rm -rf .venv

#verificar espaço em disco (pelo menos 3GB)
df -h

#criar novo virtual environment
python3 -m venv .venv
source .venv/bin/activate

#instalar requirements
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install -r requirements-ml.txt