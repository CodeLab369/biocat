import { PawPrint } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../components/common/Button.jsx'
import { Input } from '../../components/common/Input.jsx'
import { useAppStore } from '../../store/appStore.js'

export const LoginPage = () => {
  const login = useAppStore((state) => state.login)
  const session = useAppStore((state) => state.auth.session)
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  if (session) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    const result = await login(form)
    setLoading(false)
    if (result.ok) {
      toast.success('Sesión iniciada')
      navigate('/')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <section className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-sand to-white px-4 py-10 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto w-full max-w-md rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-brand/10 p-3 text-brand">
            <PawPrint className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">BIO - CAT</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Inventario</h1>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Usuario"
            placeholder="Ingresa tu usuario"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            autoComplete="username"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Validando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </section>
  )
}
