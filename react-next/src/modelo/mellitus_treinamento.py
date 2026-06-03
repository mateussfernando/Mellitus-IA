# MELLITUS.IA — Treinamento do Modelo de Previsão de Risco de Diabetes Tipo 2
# Script Python gerado a partir do notebook original

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import joblib
import json
import warnings
warnings.filterwarnings("ignore")

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, roc_curve, f1_score, recall_score, precision_score
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

def main():
    print("✅ Bibliotecas importadas com sucesso!")

    # ==========================================
    # 1. Carregamento e visualização inicial
    # ==========================================
    URL = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv"

    COLUNAS = [
        "gestacoes", "glicemia", "pressao", "espessura_pele", 
        "insulina", "imc", "historico_familiar", "idade", "diabetes"
    ]

    df = pd.read_csv(URL, header=None, names=COLUNAS)

    print("\n" + "=" * 55)
    print("  MELLITUS.IA — Dataset carregado com sucesso!")
    print("=" * 55)
    print(f"\n  Total de registros : {len(df)}")
    
    # ==========================================
    # 2. Análise exploratória e visualizações
    # ==========================================
    print("\nGerando gráfico de distribuição de variáveis...")
    fig, axes = plt.subplots(2, 4, figsize=(18, 8))
    fig.suptitle("Mellitus.IA — Distribuição das variáveis por classe", fontsize=14, fontweight="bold", y=1.01)

    features = [c for c in COLUNAS if c != "diabetes"]
    cores = ["#1D9E75", "#D85A30"] 

    for i, feat in enumerate(features):
        ax = axes[i // 4][i % 4]
        for label, cor in zip([0, 1], cores):
            subset = df[df["diabetes"] == label][feat]
            ax.hist(subset, bins=20, alpha=0.6, color=cor, label=f"{'Sem' if label == 0 else 'Com'} diabetes")
        ax.set_title(feat.replace("_", " ").capitalize(), fontsize=11)
        ax.set_xlabel("")
        ax.tick_params(labelsize=9)

    handles = [
        mpatches.Patch(color="#1D9E75", label="Sem diabetes"),
        mpatches.Patch(color="#D85A30", label="Com diabetes")
    ]
    fig.legend(handles=handles, loc="lower center", ncol=2, fontsize=11, bbox_to_anchor=(0.5, -0.04))
    plt.tight_layout()
    plt.savefig("distribuicao_variaveis.png", dpi=150, bbox_inches="tight")
    # plt.show() # Comentado para não travar a execução no terminal
    print("📊 Gráfico salvo como 'distribuicao_variaveis.png'")

    # ==========================================
    # 3. Limpeza e tratamento dos dados
    # ==========================================
    colunas_com_zeros_invalidos = ["glicemia", "pressao", "espessura_pele", "insulina", "imc"]
    for col in colunas_com_zeros_invalidos:
        df[col] = df[col].replace(0, np.nan)
        medianas = df.groupby("diabetes")[col].transform("median")
        df[col] = df[col].fillna(medianas)
        
    print("\n✅ Dados tratados! (Zeros substituídos pela mediana)")

    # ==========================================
    # 4. Engenharia de features
    # ==========================================
    df["glicemia_x_imc"]    = df["glicemia"] * df["imc"]
    df["idade_x_imc"]       = df["idade"] * df["imc"]
    df["glicemia_quadrado"] = df["glicemia"] ** 2
    df["categoria_imc"] = pd.cut(
        df["imc"], bins=[0, 18.5, 24.9, 29.9, 100], labels=[0, 1, 2, 3]
    ).astype(int)

    # ==========================================
    # 5. Separação treino/teste e balanceamento
    # ==========================================
    X = df.drop("diabetes", axis=1)
    y = df["diabetes"]
    FEATURE_NAMES = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    smote = SMOTE(random_state=42)
    X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)
    print(f"\nTreino balanceado (SMOTE): {len(X_train_bal)} registros")

    # ==========================================
    # 6. Treinamento e Comparação
    # ==========================================
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    candidatos = {
        "Regressão Logística": Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression(max_iter=1000, random_state=42))]),
        "Random Forest": Pipeline([("scaler", StandardScaler()), ("model", RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42))]),
        "Gradient Boosting": Pipeline([("scaler", StandardScaler()), ("model", GradientBoostingClassifier(n_estimators=200, learning_rate=0.05, random_state=42))]),
        "XGBoost": Pipeline([("scaler", StandardScaler()), ("model", XGBClassifier(n_estimators=200, learning_rate=0.05, use_label_encoder=False, eval_metric="logloss", random_state=42))]),
    }

    print("\nComparando modelos (validação cruzada)...\n")
    resultados = {}
    for nome, pipeline in candidatos.items():
        scores_acc  = cross_val_score(pipeline, X_train_bal, y_train_bal, cv=cv, scoring="accuracy")
        scores_roc  = cross_val_score(pipeline, X_train_bal, y_train_bal, cv=cv, scoring="roc_auc")
        resultados[nome] = {"ROC-AUC": scores_roc.mean()}
        print(f"  {nome:25s} → ROC-AUC: {scores_roc.mean():.3f} | Acc: {scores_acc.mean():.3f}")

    melhor_nome = max(resultados, key=lambda k: resultados[k]["ROC-AUC"])
    print(f"\n🏆 Melhor modelo: {melhor_nome}")

    # ==========================================
    # 7. Treino final e Métricas
    # ==========================================
    modelo_final = candidatos[melhor_nome]
    modelo_final.fit(X_train_bal, y_train_bal)
    
    y_pred      = modelo_final.predict(X_test)
    y_pred_prob = modelo_final.predict_proba(X_test)[:, 1]

    acc     = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_prob)
    f1      = f1_score(y_test, y_pred)
    recall  = recall_score(y_test, y_pred)

    print("\n" + "=" * 55)
    print(f"  RESULTADOS FINAIS — {melhor_nome}")
    print("=" * 55)
    print(f"  Acurácia : {acc:.4f}")
    print(f"  ROC-AUC  : {roc_auc:.4f}")
    print(f"  F1-Score : {f1:.4f}")
    print(f"  Recall   : {recall:.4f}")
    print("=" * 55)

    # ==========================================
    # 8. Salvar Modelo (.pkl) e Artefatos (.json)
    # ==========================================
    joblib.dump(modelo_final, "mellitus_modelo.pkl")
    print("\n✅ Modelo salvo: mellitus_modelo.pkl")

    artefatos = {
        "features": FEATURE_NAMES,
        "modelo_nome": melhor_nome,
        "metricas": {"acuracia": round(acc, 4), "roc_auc": round(roc_auc, 4)}
    }
    with open("mellitus_artefatos.json", "w", encoding="utf-8") as f:
        json.dump(artefatos, f, ensure_ascii=False, indent=2)
    print("✅ Artefatos salvos: mellitus_artefatos.json")
    print("\n🚀 FIM DA EXECUÇÃO!")

if __name__ == "__main__":
    main()
