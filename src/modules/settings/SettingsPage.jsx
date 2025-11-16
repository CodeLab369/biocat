import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../components/common/Button.jsx'
import { Card } from '../../components/common/Card.jsx'
import { Input } from '../../components/common/Input.jsx'
import { useTheme } from '../../context/ThemeProvider.jsx'
import { useAppStore } from '../../store/appStore.js'

export const SettingsPage = () => {
  const exportAllData = useAppStore((state) => state.exportAllData)
  const restoreAllData = useAppStore((state) => state.restoreAllData)
  const updateCredentials = useAppStore((state) => state.updateCredentials)
  const lowStockThreshold = useAppStore((state) => state.settings.lowStockThreshold)
  const setLowStockThreshold = useAppStore((state) => state.setLowStockThreshold)
  const { mode, setThemeMode } = useTheme()

  const [credentialsForm, setCredentialsForm] = useState({
    username: '',
    password: '',
    currentPassword: '',
    confirmPassword: '',
  })
  const [thresholdField, setThresholdField] = useState(() => lowStockThreshold.toString())
  const fileInputRef = useRef(null)

  useEffect(() => {
    setThresholdField(lowStockThreshold.toString())
  }, [lowStockThreshold])

  const handleCredentialsSubmit = (event) => {
    event.preventDefault()
    if (credentialsForm.password && credentialsForm.password !== credentialsForm.confirmPassword) {
      toast.error('Las nuevas contraseñas no coinciden')
      return
    }
    const result = updateCredentials({
      username: credentialsForm.username,
      password: credentialsForm.password,
      currentPassword: credentialsForm.currentPassword,
    })
    if (result.ok) {
      toast.success('Credenciales actualizadas')
      setCredentialsForm({ username: '', password: '', currentPassword: '', confirmPassword: '' })
    } else {
      toast.error(result.message)
    }
  }

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'respaldo-biocat.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Backup generado')
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const result = restoreAllData(json)
      if (result.ok) {
        toast.success('Datos restaurados')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Archivo inválido')
    } finally {
      event.target.value = ''
    }
  }

  const handleThresholdSubmit = (event) => {
    event.preventDefault()
    const updated = setLowStockThreshold(Number(thresholdField))
    setThresholdField(updated.toString())
    toast.success('Umbral de alertas actualizado')
  }

  return (
    <div className="space-y-6">
      <Card title="Credenciales" subtitle="Actualiza el acceso seguro">
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleCredentialsSubmit}>
          <Input
            label="Nuevo usuario"
            placeholder="Anahi"
            value={credentialsForm.username}
            onChange={(event) => setCredentialsForm((prev) => ({ ...prev, username: event.target.value }))}
          />
          <Input
            label="Contraseña actual"
            type="password"
            placeholder="••••"
            value={credentialsForm.currentPassword}
            onChange={(event) => setCredentialsForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
            required
          />
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="••••"
            value={credentialsForm.password}
            onChange={(event) => setCredentialsForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••"
            value={credentialsForm.confirmPassword}
            onChange={(event) => setCredentialsForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
          />
          <div className="flex justify-end lg:col-span-2">
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </Card>

      <Card title="Tema" subtitle="Automático por sistema o modo manual">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            {[
              { label: 'Claro', value: 'light' },
              { label: 'Oscuro', value: 'dark' },
              { label: 'Sistema', value: 'system' },
            ].map((option) => (
              <label
                key={option.value}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  mode === option.value
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-slate-200 text-slate-500 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  className="sr-only"
                  checked={mode === option.value}
                  onChange={() => setThemeMode(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            La preferencia se guarda en localStorage y respeta el modo del sistema.
          </p>
        </div>
      </Card>

      <Card title="Alertas de stock" subtitle="Define cuántas unidades disparan una alerta en el dashboard">
        <form className="flex flex-col gap-3 lg:flex-row lg:items-end" onSubmit={handleThresholdSubmit}>
          <div className="flex-1">
            <Input
              label="Umbral mínimo"
              type="number"
              min="0"
              value={thresholdField}
              inputMode="numeric"
              onChange={(event) => setThresholdField(event.target.value)}
            />
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Los productos con menos de este valor aparecerán en “Alertas de stock”.
            </p>
          </div>
          <Button type="submit">Guardar umbral</Button>
        </form>
      </Card>

      <Card
        title="Respaldo y restauración"
        subtitle="Exporta o importa todos los datos locales"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleExport}>
              Exportar JSON
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
            <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Importar JSON
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ideal para mover los datos hacia una API o Supabase. Exporta el archivo y úsalo de base para un seeding inicial.
        </p>
      </Card>
    </div>
  )
}
