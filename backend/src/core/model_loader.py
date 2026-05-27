import joblib
import pandas as pd
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../../modelo/mellitus_modelo.pkl")
modelo_ia = None

def load_model():
    global modelo_ia
    try:
        if os.path.exists(MODEL_PATH):
            modelo_ia = joblib.load(MODEL_PATH)
            print("✅ Modelo de IA carregado com sucesso pela API!")
        else:
            print(f"⚠️ O arquivo .pkl não foi encontrado no caminho: {MODEL_PATH}")
    except Exception as e:
        print(f"⚠️ Erro ao carregar o modelo de IA: {e}")

def prever_risco_diabetes(dados_paciente: dict):
    if not modelo_ia:
        raise Exception("Modelo de IA não carregado.")
        
    dados = {
        "gestacoes": [dados_paciente.get("gestacoes") or 0.0],
        "glicemia": [dados_paciente.get("glicemia")],
        "pressao": [dados_paciente.get("pressao")],
        "espessura_pele": [dados_paciente.get("espessura_pele") or 20.0],
        "insulina": [dados_paciente.get("insulina") or 79.0],
        "imc": [dados_paciente.get("imc")],
        "historico_familiar": [dados_paciente.get("historico_familiar") or 0.5],
        "idade": [dados_paciente.get("idade")]
    }
    
    df = pd.DataFrame(dados)
    
    # Feature Engineering idêntico ao Jupyter original
    df["glicemia_x_imc"]    = df["glicemia"] * df["imc"]
    df["idade_x_imc"]       = df["idade"] * df["imc"]
    df["glicemia_quadrado"] = df["glicemia"] ** 2
    
    df["categoria_imc"] = pd.cut(
        df["imc"], bins=[0, 18.5, 24.9, 29.9, 100], labels=[0, 1, 2, 3]
    ).astype(int)
    
    # Prever probabilidade da classe 1 (Ter diabetes)
    probabilidade = float(modelo_ia.predict_proba(df)[0][1])
    
    risco = "BAIXO"
    if probabilidade > 0.7:
        risco = "ALTO"
    elif probabilidade > 0.4:
        risco = "MODERADO"
        
    return probabilidade, risco
