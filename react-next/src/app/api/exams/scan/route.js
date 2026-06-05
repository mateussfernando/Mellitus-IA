import Anthropic from '@anthropic-ai/sdk'
import { withAuth } from '@/lib/middleware'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ detail: 'Arquivo não fornecido.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const mediaType = file.type === 'application/pdf' ? 'image/png' : file.type

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Este é um laudo laboratorial brasileiro. Extraia TODOS os resultados e retorne APENAS JSON válido (nada mais, sem markdown):
{
  "lab_name": "string (nome do laboratório ex: Fleury, DASA)",
  "exam_date": "YYYY-MM-DD",
  "exam_category": "hemograma|glicemia|lipidios|funcao_renal|funcao_hepatica|tireoide|inflamacao|coagulacao|vitaminas|hormonios|urina|marcadores_cardiacos|marcadores_tumorais",
  "values": { "nome_parametro": valor_numerico },
  "units": { "nome_parametro": "unidade" },
  "reference_min": { "nome_parametro": valor_numerico },
  "reference_max": { "nome_parametro": valor_numerico },
  "flags": { "nome_parametro": "H"|"L"|null }
}
Se houver múltiplas categorias de exames, retorne um array de objetos.
Mapear nomes de parâmetros para português simplificado (ex: "glicemia", "hemoglobina", "pressao_sistolica", "ldl", "hba1c", etc).
Retorne APENAS JSON, sem explicações.`,
            },
          ],
        },
      ],
    })

    const responseText = message.content[0].text
    let extractedData

    try {
      extractedData = JSON.parse(responseText)
    } catch {
      return Response.json(
        { detail: 'Não foi possível extrair dados do arquivo. Tente uma imagem mais clara.' },
        { status: 400 }
      )
    }

    // Normalizar para array
    if (!Array.isArray(extractedData)) {
      extractedData = [extractedData]
    }

    return Response.json({
      exams: extractedData,
      raw_response: responseText,
    })
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
