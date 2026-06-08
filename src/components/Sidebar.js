'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const nav = [
  {
    href: '/dashboard',
    label: 'Pacientes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952
             4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07
             M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766
             l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0
             3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0
             2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname          = usePathname()
  const { data: session } = useSession()
  const [open, setOpen]   = useState(false)

  return (
    <>
      {/* Botão hamburger — só no mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-sidebar rounded-lg
                   flex items-center justify-center text-white shadow-lg cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Backdrop — mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 h-screen
        w-60 bg-sidebar flex flex-col shrink-0
        transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>

        {/* Botão fechar — mobile */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">Mellitus.IA</p>
              <p className="text-white/40 text-[10px] mt-0.5">Assistente Médico</p>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Menu</p>
          {nav.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-primary/20 text-primary'
                    : 'text-white/60 hover:bg-sidebar-hover hover:text-white/90'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Usuário + logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
              <span className="text-primary text-sm font-bold">
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/90 text-xs font-medium truncate">{session?.user?.name ?? '—'}</p>
              <p className="text-white/40 text-[10px] truncate">{session?.user?.email ?? ''}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/50
                       hover:bg-sidebar-hover hover:text-white/80 text-xs font-medium transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5
                   A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
