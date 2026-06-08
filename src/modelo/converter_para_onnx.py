# Converte mellitus_modelo.pkl → mellitus_modelo.onnx
# Instale as dependências antes de rodar:
#   pip install skl2onnx onnxmltools onnxruntime

import joblib
import numpy as np
import os
import sys

MODEL_PATH  = os.path.join(os.path.dirname(__file__), "mellitus_modelo.pkl")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "mellitus_modelo.onnx")

# 12 features na ordem exata usada no treinamento:
# gestacoes, glicemia, pressao, espessura_pele, insulina, imc,
# historico_familiar, idade, glicemia_x_imc, idade_x_imc, glicemia_quadrado, categoria_imc
N_FEATURES = 12

def main():
    print("Carregando modelo .pkl...")
    modelo = joblib.load(MODEL_PATH)

    inner_model = modelo.named_steps["model"]
    model_type  = type(inner_model).__name__
    print(f"Modelo detectado: {model_type}")

    try:
        from skl2onnx.common.data_types import FloatTensorType
    except ImportError:
        print("❌ Instale: pip install skl2onnx onnxmltools onnxruntime")
        sys.exit(1)

    initial_type = [("float_input", FloatTensorType([None, N_FEATURES]))]

    if model_type == "XGBClassifier":
        try:
            from skl2onnx import convert_sklearn, update_registered_converter
            from skl2onnx.common.shape_calculator import calculate_linear_classifier_output_shapes
            from onnxmltools.convert.xgboost.operator_converters.XGBoost import convert_xgboost
            from xgboost import XGBClassifier

            update_registered_converter(
                XGBClassifier,
                "XGBoostXGBClassifier",
                calculate_linear_classifier_output_shapes,
                convert_xgboost,
                options={"nocl": [True, False], "zipmap": [True, False]},
            )

            onnx_model = convert_sklearn(
                modelo,
                initial_types=initial_type,
                options={XGBClassifier: {"nocl": True, "zipmap": False}},
                target_opset={"": 17, "ai.onnx.ml": 3},
            )
        except ImportError:
            print("❌ Para XGBoost instale: pip install onnxmltools")
            sys.exit(1)
    else:
        from skl2onnx import convert_sklearn

        onnx_model = convert_sklearn(
            modelo,
            initial_types=initial_type,
            options={"zipmap": False},
        )

    with open(OUTPUT_PATH, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"[OK] Modelo ONNX salvo: {OUTPUT_PATH}")

    # Teste rápido de inferência para garantir que o arquivo está correto
    import onnxruntime as rt

    sess       = rt.InferenceSession(OUTPUT_PATH)
    input_name = sess.get_inputs()[0].name

    # Dados fictícios: gestacoes=2, glicemia=120, pressao=70, espessura=20,
    # insulina=79, imc=30, historico=0.5, idade=35 + features calculadas
    glicemia, imc, idade = 120.0, 30.0, 35.0
    test_row = np.array([[
        2.0, glicemia, 70.0, 20.0, 79.0, imc, 0.5, idade,
        glicemia * imc,   # glicemia_x_imc
        idade * imc,      # idade_x_imc
        glicemia ** 2,    # glicemia_quadrado
        2.0               # categoria_imc (imc 30 → obesidade grau I → label 2)
    ]], dtype=np.float32)

    outputs       = sess.run(None, {input_name: test_row})
    probabilidade = float(outputs[1][0][1])

    print(f"[OK] Teste de inferencia OK - probabilidade de diabetes: {probabilidade:.4f}")
    print("")
    print("Proximo passo: copie 'mellitus_modelo.onnx' para o seu projeto JavaScript")
    print("e instale:  npm install onnxruntime-node")

if __name__ == "__main__":
    main()
