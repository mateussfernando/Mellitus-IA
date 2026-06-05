import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function serializeHistory(patient) {
  const exams = patient.examResults || []
  if (exams.length === 0) return 'Paciente sem exames registrados.'

  return exams
    .reverse()
    .map((e, i) => {
      const params = Object.entries(e.values || {})
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')
      return `Exame ${i + 1} (${new Date(e.exam_date).toLocaleDateString('pt-BR')}): ${e.exam_category} - ${params}`
    })
    .join('\n')
}

export const GET = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params
    const patient = await prisma.patient.findFirst({
      where: { id: Number(id), user_id: Number(session.user.id) },
      include: { examResults: { orderBy: { exam_date: 'asc' } } },
    })

    if (!patient || !patient.is_active) {
      return Response.json({ detail: 'Paciente não encontrado.' }, { status: 404 })
    }

    if (!patient.examResults || patient.examResults.length === 0) {
      return Response.json({
        insights: [
          {
            tipo: 'info',
            descricao: 'Paciente sem exames para análise. Realize o upload de laudos para gerar insights.',
            urgencia: 'info',
          },
        ],
      })
    }

    const historyText = serializeHistory(patient)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: `Você é um assistente médico de apoio à decisão clínica brasileiro.
Analise dados longitudinais de pacientes e identifique:
1. Tendências preocupantes (valores subindo/descendo ao longo do tempo)
2. Correlações entre domínios (ex: LDL alto + TSH alto = hipotireoidismo causando dislipidemia)
3. Padrões de síndrome metabólica, DRC progressiva, anemia, etc.
4. Alertas de urgência se algum valor está em range crítico
5. Sugestão de exames complementares baseada nos padrões

Seja conciso (máx 5 pontos). Nunca faça diagnóstico definitivo.
Use termos médicos em português brasileiro.
Responda APENAS em JSON válido (sem markdown, sem explicações): { "insights": [{ "tipo": "tendencia|correlacao|alerta|sugestao", "descricao": string, "urgencia": "info|aviso|critico" }] }`,
      messages: [
        {
          role: 'user',
          content: `Paciente: ${patient.name}, ${patient.sexo}, idade aproximada.
Histórico de exames:
${historyText}

Analise e retorne APENAS JSON com insights clínicos.`,
        },
      ],
    })

    const responseText = message.content[0].text
    let insights

    const cleaned = responseText.replace(/```json\s*/g, '').replace(/```/g, '').trim()

    try {
      insights = JSON.parse(cleaned)
    } catch {
      insights = {
        insights: [
          {
            tipo: 'info',
            descricao: 'Análise completa realizada. Consulte um profissional de saúde para interpretação clínica detalhada.',
            urgencia: 'info',
          },
        ],
      }
    }

    return Response.json(insights)
  } catch (e) {
    return Response.json({ detail: e.message }, { status: 500 })
  }
})
