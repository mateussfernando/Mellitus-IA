import Anthropic from '@anthropic-ai/sdk'
import { withAuth } from '@/lib/middleware'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Tenta reparar JSON truncado (ex.: resposta cortada por max_tokens),
// removendo o último elemento incompleto e fechando colchetes/chaves em aberto.
function tryParseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    // Corta no último "}" ou "]" completo e tenta fechar a estrutura
    const lastBrace = Math.max(text.lastIndexOf('},'), text.lastIndexOf('}\n'), text.lastIndexOf('}'))
    if (lastBrace === -1) return null

    let truncated = text.slice(0, lastBrace + 1)
    const opens = (truncated.match(/\[/g) || []).length
    const closes = (truncated.match(/\]/g) || []).length
    truncated += ']'.repeat(Math.max(0, opens - closes))

    try {
      return JSON.parse(truncated)
    } catch {
      return null
    }
  }
}

export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ detail: 'Arquivo não fornecido.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const isPdf = file.type === 'application/pdf'

    // PDF usa bloco "document"; imagem usa bloco "image"
    const fileBlock = isPdf
      ? {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 },
        }
      : {
          type: 'image',
          source: { type: 'base64', media_type: file.type, data: base64 },
        }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: [
            fileBlock,
            {
              type: 'text',
              text: `Este é um laudo laboratorial brasileiro. Extraia TODOS os resultados e retorne APENAS JSON válido (nada mais, sem markdown):
{
  "lab_name": "string (nome do laboratório ex: Fleury, DASA)",
  "exam_date": "YYYY-MM-DD",
  "exam_category": "hemograma|glicemia|lipidios|funcao_renal|funcao_hepatica|tireoide|inflamacao|coagulacao|vitaminas|hormonios|urina|marcadores_cardiacos|marcadores_tumorais",
  "values": { "nome_parametro": valor_numerico },
  "units": { "nome_parametro": "unidade" }
}
Se houver múltiplas categorias de exames, retorne um array de objetos (um por categoria).
Mapear nomes de parâmetros para português simplificado (ex: "glicemia", "hemoglobina", "pressao_sistolica", "ldl", "hba1c", etc).
Não inclua valores de referência, flags, métodos ou textos explicativos — apenas os campos acima.
Retorne APENAS JSON, sem explicações.`,
            },
          ],
        },
      ],
    })

    const responseText = message.content[0].text

    // Remove cercas de markdown caso o modelo as inclua
    const cleaned = responseText.replace(/```json\s*/g, '').replace(/```/g, '').trim()

    const parsed = tryParseJson(cleaned)
    if (!parsed) {
      return Response.json(
        { detail: 'Não foi possível extrair dados do arquivo. Tente uma imagem mais clara ou um arquivo com menos páginas.' },
        { status: 400 }
      )
    }

    // Normalizar para array
    const extractedData = Array.isArray(parsed) ? parsed : [parsed]

    return Response.json({
      exams: extractedData,
      raw_response: responseText,
    })
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
