'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputCls = `w-full px-4 py-3 rounded-lg bg-white border border-white/30 text-text text-sm
  placeholder:text-text-muted focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20
  transition-all outline-none`

const EMPTY = { name: '', email: '', password: '', confirm: '', crm: '' }

export default function LoginPage() {
  const [mode,    setMode]   = useState('login')
  const [error,   setError]  = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [reg,      setReg]      = useState(EMPTY)
  const [showPass, setShowPass] = useState(false)

  function setR(k, v) { setReg(p => ({ ...p, [k]: v })) }

  function switchMode(m) { setMode(m); setError('') }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError('E-mail ou senha inválidos.')
    else router.push('/dashboard')
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (reg.password !== reg.confirm) { setError('As senhas não coincidem.'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reg.name, email: reg.email, password: reg.password, crm: reg.crm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Erro ao cadastrar.')
      const login = await signIn('credentials', { email: reg.email, password: reg.password, redirect: false })
      if (login?.error) { switchMode('login'); setEmail(reg.email) }
      else router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">

      {/* ── Lado esquerdo ─────────────────────────────── */}
      <div className="flex-1 relative bg-sidebar flex flex-col justify-between px-16 py-14 overflow-hidden">

        {/* Gradiente decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-sidebar to-[#0d2a1e]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-primary/5 blur-2xl" />

        {/* Logo topo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Mellitus.IA</span>
        </div>

        {/* Texto central */}
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-3.5 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-semibold tracking-wide">Powered by Machine Learning</span>
          </div>

          <h1 className="text-5xl font-bold text-white leading-[1.15] mb-6">
            Predição de Risco<br />
            de Diabetes Tipo 2<br />
            <span className="text-primary">com IA.</span>
          </h1>

          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Analise os dados clínicos dos seus pacientes e receba em segundos
            uma previsão precisa de risco — gerada por um modelo XGBoost
            treinado com dados reais.
          </p>

          <ul className="space-y-3">
            {[
              'Predição instantânea: ALTO, MODERADO ou BAIXO',
              'Modelo treinado com o dataset Pima Indians Diabetes',
              'Feature engineering automático com IMC e glicemia',
              'Histórico completo de pacientes com rastreabilidade',
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-white/70 text-sm">
                <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Rodapé */}
        <p className="relative z-10 text-white/25 text-xs">
          Mellitus.IA © {new Date().getFullYear()} — Uso clínico exclusivo
        </p>
      </div>

      {/* ── Lado direito (formulário) ──────────────────── */}
      <div className="w-[420px] h-screen bg-primary flex flex-col">
        <div className={`flex flex-col flex-1 justify-center px-10 ${mode === 'register' ? 'py-6' : 'py-14'}`}>

          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Boas-vindas!' : 'Criar conta'}
            </h2>
            <p className="text-white/65 text-sm mt-1">
              {mode === 'login'
                ? 'Informe seus dados para acessar o painel'
                : 'Preencha os dados para se cadastrar'}
            </p>
          </div>

          {/* LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/80 text-xs font-semibold mb-1.5 uppercase tracking-wide">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="dr.nome@hospital.com" required className={inputCls} />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-semibold mb-1.5 uppercase tracking-wide">Senha</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required className={inputCls + ' pr-11'} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors">
                    {showPass
                      ? <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      : <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                    }
                  </button>
                </div>
              </div>
              {error && <ErrorMsg>{error}</ErrorMsg>}
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? 'Entrando…' : 'Acessar'}
              </button>
            </form>
          )}

          {/* REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-white/80 text-xs font-semibold mb-1.5 uppercase tracking-wide">Nome completo</label>
                <input value={reg.name} onChange={e => setR('name', e.target.value)}
                  placeholder="Dr. João Silva" required className={inputCls} />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-semibold mb-1.5 uppercase tracking-wide">E-mail</label>
                <input type="email" value={reg.email} onChange={e => setR('email', e.target.value)}
                  placeholder="dr.nome@hospital.com" required className={inputCls} />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  CRM / COREN <span className="text-white/40 normal-case font-normal">(opcional)</span>
                </label>
                <input value={reg.crm} onChange={e => setR('crm', e.target.value)}
                  placeholder="12345-SP" className={inputCls} />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-semibold mb-1.5 uppercase tracking-wide">Senha</label>
                <input type="password" value={reg.password} onChange={e => setR('password', e.target.value)}
                  placeholder="••••••••" required minLength={6} className={inputCls} />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-semibold mb-1.5 uppercase tracking-wide">Confirmar senha</label>
                <input type="password" value={reg.confirm} onChange={e => setR('confirm', e.target.value)}
                  placeholder="••••••••" required minLength={6} className={inputCls} />
              </div>
              {/* Aviso LGPD */}
              <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="lgpd"
                    type="checkbox"
                    required
                    className="mt-0.5 w-4 h-4 shrink-0 accent-white cursor-pointer"
                  />
                  <label htmlFor="lgpd" className="text-white/80 text-xs leading-relaxed cursor-pointer">
                    Li e concordo que os <strong className="text-white">dados clínicos anonimizados</strong> dos
                    pacientes cadastrados (glicemia, IMC, pressão arterial, etc.) poderão ser utilizados para
                    aprimoramento contínuo do modelo de IA. <strong className="text-white">Dados pessoais
                    identificáveis (nome, CPF) nunca são compartilhados</strong>, em conformidade com a{' '}
                    <strong className="text-white">Lei 13.709/2018 (LGPD)</strong>, Art. 11, que regula o
                    tratamento de dados de saúde.
                  </label>
                </div>
              </div>

              {error && <ErrorMsg>{error}</ErrorMsg>}
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? 'Criando conta…' : 'Criar conta'}
              </button>
            </form>
          )}

          {/* Toggle login / cadastro */}
          <p className="text-center text-white/55 text-sm mt-6">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-white font-semibold hover:underline transition-all cursor-pointer"
            >
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>

    </div>
  )
}

function ErrorMsg({ children }) {
  return (
    <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      {children}
    </p>
  )
}

const btnCls = `w-full py-3 rounded-lg bg-white text-primary font-bold text-sm
  hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1`
