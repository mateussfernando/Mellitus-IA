'use client'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'

export default function Home() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.nav-anim', { y: -30, opacity: 0, duration: 0.6 })
        .from('.hero-badge', { y: 20, opacity: 0, duration: 0.5 }, '-=0.2')
        .from('.hero-line', { y: 40, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.1')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
        .from('.feature-card', { y: 30, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.2')

      // Blobs flutuando continuamente
      gsap.to('.blob-1', { y: -30, x: 20, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.blob-2', { y: 25, x: -15, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' })

      // Pulso do indicador
      gsap.to('.pulse-dot', { scale: 1.6, opacity: 0, duration: 1.5, repeat: -1, ease: 'power1.out' })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="relative min-h-screen bg-sidebar overflow-hidden">

      {/* Fundo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-sidebar to-[#0d2a1e]" />
      <div className="blob-1 absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl" />
      <div className="blob-2 absolute -bottom-40 -right-32 w-[32rem] h-[32rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(29,158,117,0.12),transparent_60%)]" />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Navbar */}
        <nav className="nav-anim flex items-center justify-between px-6 md:px-16 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Mellitus.IA</span>
          </div>
          <Link
            href="/login"
            className="cursor-pointer px-5 py-2 rounded-lg bg-white/10 border border-white/20 text-white
                       text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            Acessar
          </Link>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-5 md:px-6 max-w-4xl mx-auto md:-mt-10 py-8 md:py-0">

          <div className="hero-badge inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-3 md:px-4 py-1.5 mb-5 md:mb-8">
            <span className="relative flex w-2 h-2 shrink-0">
              <span className="pulse-dot absolute inline-flex w-full h-full rounded-full bg-primary" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
            </span>
            <span className="text-primary text-[10px] md:text-xs font-semibold tracking-wide">IA aplicada à saúde</span>
          </div>

          <h1 className="text-3xl md:text-6xl font-bold text-white leading-[1.1] mb-4 md:mb-6">
            <span className="hero-line block">Seu assistente</span>
            <span className="hero-line block">médico inteligente</span>
            <span className="hero-line block text-primary">com IA.</span>
          </h1>

          <p className="hero-sub text-white/60 text-base md:text-xl leading-relaxed max-w-2xl mb-7 md:mb-10">
            Escaneie laudos, acompanhe a evolução dos seus pacientes e receba insights
            clínicos gerados por IA que cruzam todos os exames — revelando padrões que
            passariam despercebidos.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 md:mb-16 w-full sm:w-auto">
            <Link
              href="/login"
              className="hero-cta cursor-pointer group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary
                         hover:bg-primary-dark text-white font-bold text-base transition-colors shadow-lg shadow-primary/25"
            >
              Começar agora
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="hero-cta cursor-pointer flex items-center justify-center px-7 py-3.5 rounded-xl bg-white/5 border border-white/15
                         text-white/90 font-semibold text-base hover:bg-white/10 transition-colors"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl">
            {[
              { tit: 'Leitura de laudos', desc: 'IA extrai os dados de PDFs e fotos automaticamente', icon: 'M13 10V3L4 14h7v7l9-11h-7Z' },
              { tit: 'Insights por IA', desc: 'Correlações entre exames que o olhar isolado não capta', icon: 'M9 12h6m-3-3v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z' },
              { tit: 'Dados protegidos', desc: 'Acompanhamento clínico em conformidade com a LGPD', icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
            ].map(f => (
              <div key={f.tit} className="feature-card bg-white/5 border border-white/10 rounded-2xl p-5 text-left backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{f.tit}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Rodapé */}
        <footer className="text-center py-6 text-white/25 text-xs px-6">
          Mellitus.IA © {new Date().getFullYear()} — Projeto de uso clínico e educacional
        </footer>
      </div>
    </div>
  )
}
