'use client'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EXAM_CATALOG } from '@/lib/examCatalog'

const STEPS = [
  {
    n: '01',
    tit: 'Cadastre o paciente',
    desc: 'Crie o perfil com nome, CPF, sexo, data de nascimento, peso e altura.',
  },
  {
    n: '02',
    tit: 'Adicione os exames',
    desc: 'Escaneie um laudo (PDF ou foto) com leitura automática ou insira os valores manualmente.',
  },
  {
    n: '03',
    tit: 'Risco + análise',
    desc: 'Um modelo de Machine Learning classifica o risco e a IA valida o resultado e gera insights.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: '/mês',
    desc: 'Para experimentar a ferramenta.',
    items: [
      'Até 3 pacientes',
      '5 leituras de laudo por IA / mês',
      '3 análises de insights por IA / mês',
      'Entrada manual ilimitada',
      'Risco de diabetes por Machine Learning',
      'Histórico e gráficos de evolução',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'R$ 79',
    period: '/mês',
    desc: 'Para o médico clínico no dia a dia.',
    items: [
      'Pacientes ilimitados',
      '50 leituras de laudo por IA / mês',
      '30 análises de insights por IA / mês',
      'Histórico completo + alertas instantâneos',
      'Risco de diabetes por Machine Learning',
    ],
    highlight: true,
  },
  {
    name: 'Max',
    price: 'R$ 199',
    period: '/mês',
    desc: 'Para clínicas com múltiplos médicos.',
    items: [
      'Tudo do Pro, sem limites de IA',
      'Múltiplos usuários por conta',
      'Fila de processamento prioritária',
      'Suporte prioritário',
    ],
    highlight: false,
  },
]

const FEATURES = [
  {
    tit: 'Leitura de laudos por IA',
    desc: 'Envie o PDF ou uma foto do exame e a IA extrai todos os valores automaticamente.',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  },
  {
    tit: 'Entrada manual flexível',
    desc: 'Prefere digitar? Selecione a categoria e preencha só os valores que tiver em mãos.',
    icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z',
  },
  {
    tit: 'Análise longitudinal',
    desc: 'Acompanhe a evolução de cada parâmetro ao longo do tempo, consulta após consulta.',
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  },
  {
    tit: 'Correlações ocultas',
    desc: 'Padrões que um olhar isolado não capta — como LDL alto causado por hipotireoidismo.',
    icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a7.723 7.723 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z',
  },
  {
    tit: 'Risco por Machine Learning',
    desc: 'Um modelo Random Forest classifica o risco de diabetes em baixo, médio ou alto.',
    icon: 'M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z',
  },
  {
    tit: 'Dados protegidos',
    desc: 'Acompanhamento clínico com privacidade, em conformidade com a LGPD.',
    icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
  },
]

export default function Home() {
  const root = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.nav-anim', { y: -30, opacity: 0, duration: 0.6 })
        .from('.hero-badge', { y: 20, opacity: 0, duration: 0.5 }, '-=0.2')
        .from('.hero-line', { y: 40, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.1')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
        .from('.hero-card', { y: 40, opacity: 0, scale: 0.96, duration: 0.7 }, '-=0.4')

      gsap.to('.blob-1', { y: -30, x: 20, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.blob-2', { y: 25, x: -15, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.pulse-dot', { scale: 1.6, opacity: 0, duration: 1.5, repeat: -1, ease: 'power1.out' })

      // Reveal on scroll
      gsap.utils.toArray('.reveal').forEach(el => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%' },
          y: 40, opacity: 0, duration: 0.7, ease: 'power3.out',
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="relative bg-sidebar overflow-hidden">

      {/* Fundo decorativo global */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-sidebar to-[#0a1628]" />
      <div className="blob-1 absolute top-0 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl" />
      <div className="blob-2 absolute top-[60vh] -right-32 w-[32rem] h-[32rem] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10">

        {/* Navbar */}
        <nav className="nav-anim sticky top-0 z-30 backdrop-blur-md bg-sidebar/70 border-b border-white/5">
          <div className="flex items-center justify-between px-6 md:px-16 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Mellitus.IA</span>
            </div>
            <Link href="/login" className="cursor-pointer px-5 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
              Acessar
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <header className="px-5 md:px-16 max-w-7xl mx-auto pt-16 md:pt-24 pb-20 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="hero-badge inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-3 md:px-4 py-1.5 mb-6">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="pulse-dot absolute inline-flex w-full h-full rounded-full bg-primary" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
                </span>
                <span className="text-primary text-[10px] md:text-xs font-semibold tracking-wide">Machine Learning + IA generativa</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.08] mb-5">
                <span className="hero-line block">A inteligência</span>
                <span className="hero-line block">que enxerga o que</span>
                <span className="hero-line block text-primary">passa despercebido.</span>
              </h1>

              <p className="hero-sub text-white/60 text-base md:text-lg leading-relaxed max-w-xl mb-8">
                Escaneie laudos e acompanhe a evolução dos seus pacientes. Um modelo de
                Machine Learning classifica o risco de diabetes e a IA valida o resultado,
                cruzando todos os exames — apoiando decisões mais precisas.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/login" className="hero-cta cursor-pointer group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-base transition-colors shadow-lg shadow-primary/25">
                  Começar agora
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link href="/login" className="hero-cta cursor-pointer flex items-center justify-center px-7 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white/90 font-semibold text-base hover:bg-white/10 transition-colors">
                  Já tenho conta
                </Link>
              </div>
            </div>

            {/* Mockup de análise */}
            <div className="hero-card relative">
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm font-bold">M</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-none">Maria S.</p>
                      <p className="text-white/40 text-[11px] mt-1">♀ Feminino · 54 anos</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-400/20 text-amber-300">3 exames</span>
                </div>

                {/* Risco do modelo de ML */}
                <div className="flex items-center justify-between bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2.5 mb-2.5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">Risco (Machine Learning)</p>
                    <p className="text-amber-300 text-sm font-bold">Risco moderado</p>
                  </div>
                  <span className="text-lg font-bold text-amber-300">58%</span>
                </div>

                <div className="space-y-2.5">
                  <InsightLine color="text-violet-300" bg="bg-violet-400/10" label="Validação"
                    text="A IA concorda com o risco moderado: HbA1c 6.0 e glicemia em alta." />
                  <InsightLine color="text-blue-300" bg="bg-blue-400/10" label="Tendência"
                    text="Glicemia subiu de 98 → 112 → 121 mg/dL nos últimos 3 meses." />
                  <InsightLine color="text-emerald-300" bg="bg-emerald-400/10" label="Sugestão"
                    text="Solicitar nova HbA1c para confirmar evolução para pré-diabetes." />
                </div>
              </div>
              <div className="absolute -inset-3 bg-primary/10 blur-2xl rounded-full -z-10" />
            </div>
          </div>

          {/* Stats strip */}
          <div className="reveal grid grid-cols-3 gap-4 mt-16 md:mt-20 max-w-3xl">
            {[
              { v: '80+', l: 'parâmetros clínicos' },
              { v: String(EXAM_CATALOG.length), l: 'categorias de exames' },
              { v: '2', l: 'formas de entrada' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{s.v}</p>
                <p className="text-white/50 text-xs md:text-sm mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </header>

        {/* Como funciona */}
        <section className="px-5 md:px-16 max-w-7xl mx-auto py-16 md:py-24">
          <div className="reveal text-center mb-12 md:mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-2xl md:text-4xl font-bold text-white">Do laudo à análise em 3 passos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map(s => (
              <div key={s.n} className="reveal bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                <span className="text-primary/40 text-4xl font-bold">{s.n}</span>
                <h3 className="text-white font-semibold text-lg mt-3 mb-2">{s.tit}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recursos */}
        <section className="px-5 md:px-16 max-w-7xl mx-auto py-16 md:py-24">
          <div className="reveal text-center mb-12 md:mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Recursos</p>
            <h2 className="text-2xl md:text-4xl font-bold text-white">Tudo o que um assistente clínico precisa</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.tit} className="reveal bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{f.tit}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categorias de exames */}
        <section className="px-5 md:px-16 max-w-7xl mx-auto py-16 md:py-24">
          <div className="reveal bg-gradient-to-br from-primary/10 to-transparent border border-white/10 rounded-3xl p-8 md:p-12 text-center">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Cobertura</p>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">Da glicemia aos marcadores tumorais</h2>
            <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto mb-8">
              Suporte às principais categorias de exames laboratoriais usadas na prática clínica brasileira.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {EXAM_CATALOG.map(c => (
                <span key={c.key} className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium">
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section className="px-5 md:px-16 max-w-7xl mx-auto py-16 md:py-24">
          <div className="reveal text-center mb-12 md:mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Planos</p>
            <h2 className="text-2xl md:text-4xl font-bold text-white">Escolha o plano ideal para você</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map(p => (
              <div
                key={p.name}
                className={`reveal flex flex-col rounded-2xl p-6 border ${
                  p.highlight
                    ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/20'
                    : 'bg-white/[0.03] border-white/10'
                }`}
              >
                {p.highlight && (
                  <span className="self-start mb-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-primary text-white">
                    Mais popular
                  </span>
                )}
                <h3 className="text-white font-bold text-xl mb-1">{p.name}</h3>
                <p className="text-white/50 text-sm mb-4">{p.desc}</p>
                <div className="mb-5">
                  <span className="text-3xl md:text-4xl font-bold text-white">{p.price}</span>
                  <span className="text-white/50 text-sm">{p.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {p.items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
                      <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`cursor-pointer text-center px-5 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    p.highlight
                      ? 'bg-primary hover:bg-primary-dark text-white'
                      : 'bg-white/5 border border-white/15 text-white/90 hover:bg-white/10'
                  }`}
                >
                  Começar
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="px-5 md:px-16 max-w-7xl mx-auto py-16 md:py-24">
          <div className="reveal text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Pronto para começar?</h2>
            <p className="text-white/55 text-base md:text-lg max-w-xl mx-auto mb-8">
              Crie sua conta e transforme exames em decisões clínicas mais inteligentes.
            </p>
            <Link href="/login" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-base transition-colors shadow-lg shadow-primary/25">
              Criar conta gratuita
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Rodapé */}
        <footer className="border-t border-white/5 mt-8">
          <div className="py-8 px-6">
            <p className="text-center text-white/25 text-xs">
              Mellitus.IA © {new Date().getFullYear()} — Projeto de uso clínico e educacional.
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> · </span>
              Não substitui avaliação médica profissional.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

function InsightLine({ color, bg, label, text }) {
  return (
    <div className={`flex items-start gap-2.5 ${bg} rounded-lg px-3 py-2.5`}>
      <span className={`${color} text-[10px] font-bold uppercase tracking-wide shrink-0 mt-0.5 w-16`}>{label}</span>
      <p className="text-white/70 text-xs leading-relaxed">{text}</p>
    </div>
  )
}
