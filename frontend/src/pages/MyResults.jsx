import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getMyAttempts } from "@/lib/api"
import { useAuth } from "@/auth/auth-context"
import {
  ClipboardList,
  ArrowLeft,
  Trophy,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

function formatDate(iso) {
  if (!iso) return "-"
  return new Date(iso).toLocaleString()
}

function ResultBadge({ percent }) {
  if (percent >= 80)
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 text-sm font-semibold">
        <Trophy className="h-4 w-4" /> Відмінно
      </span>
    )
  if (percent >= 50)
    return (
      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700 text-sm font-semibold">
        <CheckCircle2 className="h-4 w-4" /> Добре
      </span>
    )
  return (
    <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-red-700 text-sm font-semibold">
      <AlertTriangle className="h-4 w-4" /> Потрібно повторити
    </span>
  )
}

export default function MyResults() {
  const navigate = useNavigate()
  const { isAuthed, authLoading } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!isAuthed) {
      navigate("/login", { state: { next: "/results" } })
      return
    }

    getMyAttempts()
      .then((res) => setItems(Array.isArray(res) ? res : []))
      .catch((e) => setError(e?.message || "Не вдалося завантажити результати"))
      .finally(() => setLoading(false))
  }, [authLoading, isAuthed, navigate])

  
  
  const ordered = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : []
    arr.sort((x, y) => {
      const dx = new Date(x.finished_at || x.started_at || 0).getTime()
      const dy = new Date(y.finished_at || y.started_at || 0).getTime()
      return dx - dy
    })
    return arr
  }, [items])

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
              <ClipboardList className="h-7 w-7 text-indigo-600" />
              Мої результати
            </h1>
            <p className="mt-1 text-base text-slate-600">
              Всі ваші спроби проходження тестів
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate("/catalog")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            До каталогу
          </Button>
        </div>

        <Card className="rounded-2xl bg-white/95 shadow-md">
          <CardContent className="p-6">
            {loading && <div className="text-lg">⏳ Завантаження…</div>}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-base">
                {error}
              </div>
            )}

            {!loading && !error && ordered.length === 0 && (
              <div className="rounded-xl border bg-slate-50 p-6 text-center">
                <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                <div className="font-semibold text-lg">
                  Поки що немає спроб
                </div>
                <div className="mt-1 text-base text-slate-600">
                  Пройдіть тест — і результат з’явиться тут 🙂
                </div>
              </div>
            )}

            {!loading && !error && ordered.length > 0 && (
              <div className="space-y-4">
                {ordered.map((a, idx) => (
                  <div
                    key={a.id}
                    className="rounded-xl border bg-white p-5 transition hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xl font-bold text-slate-900">
                          {a.test_title || `Тест #${a.test}`}
                        </div>

                        
                        <div className="mt-2 text-sm font-medium text-slate-700">
                          🕒 {formatDate(a.finished_at || a.started_at)} ·{" "}
                          <span className="font-semibold text-slate-900">
                            Спроба {idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 sm:items-end">
                        <ResultBadge percent={a.percent} />

                        <div className="text-base text-slate-800">
                          {a.score} / {a.total} ·{" "}
                          <span className="font-bold">
                            {Math.round(a.percent)}%
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/test/${a.test}`)}
                        >
                          🔁 Пройти ще раз
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}