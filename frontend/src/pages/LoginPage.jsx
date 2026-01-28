import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { login, register, getMe } from "@/lib/api"
import { useAuth } from "@/auth/auth-context"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()

  const [mode, setMode] = useState("login") 
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    setOk("")
    setLoading(true)

    try {
      if (mode === "register") {
        await register({ username, password })
        setOk("Акаунт створено ✅ Виконуємо вхід...")
      }

      await login({ username, password })

      
      const me = await getMe()
      setUser(me)

      setOk("Вхід успішний ✅")

      
      const next = location.state?.next || "/catalog"
      navigate(next, { replace: true })
    } catch (err) {
      console.error(err)
      setError(err?.message || "Помилка авторизації")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Вхід</h1>
          <p className="mt-2 text-sm text-slate-600">
            Увійди або створи акаунт, щоб результати тестів зберігались.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex gap-2">
            <Button
              type="button"
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => {
                setMode("login")
                setError("")
                setOk("")
              }}
            >
              Увійти
            </Button>

            <Button
              type="button"
              variant={mode === "register" ? "default" : "outline"}
              onClick={() => {
                setMode("register")
                setError("")
                setOk("")
              }}
            >
              Реєстрація
            </Button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Username</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="наприклад: user228"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="мінімум 6 символів"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {ok && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {ok}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/catalog")}>
                Назад
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Зачекай..." : mode === "login" ? "Увійти" : "Зареєструватись"}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Підказка: якщо ти не увійшов — результати тесту працюють у гостьовому режимі та не зберігаються.
        </div>
      </div>
    </main>
  )
}