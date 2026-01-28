import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { getTests } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  warning,
  confirmLabel = "Підтвердити",
  cancelLabel = "Скасувати",
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {title}
          </DialogTitle>

          <DialogDescription className="mt-4 text-base leading-relaxed text-slate-700">
            {description}
          </DialogDescription>
        </DialogHeader>

        {warning ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="text-sm leading-relaxed text-slate-700">
                {warning}
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="mt-6 gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="h-11 text-base font-medium"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>

          <Button
            className="h-11 text-base font-semibold"
            onClick={onConfirm}
            autoFocus={open} 
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Catalog() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedTestId, setSelectedTestId] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError("")

      try {
        const data = await getTests()
        if (cancelled) return
        setTests(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
        if (cancelled) return
        setError("Помилка завантаження тестів. Перевір backend та /api/tests/")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedTest = useMemo(
    () => tests.find((t) => t.id === selectedTestId),
    [tests, selectedTestId]
  )

  const openConfirm = (id) => {
    setSelectedTestId(id)
    setConfirmOpen(true)
  }

  const onConfirm = () => {
    if (!selectedTestId) return
    setConfirmOpen(false)
    navigate(`/test/${selectedTestId}`)
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-48 -right-48 h-[560px] w-[560px] rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Каталог тестів
        </h1>

        <p className="mt-2 max-w-2xl text-slate-100 font-medium">
          Оберіть тему та розпочніть тестування.
        </p>

        {loading && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-slate-200/80">
            Завантаження...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200/60 bg-red-500/10 p-4 text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test.id}
                className="flex min-h-[280px] flex-col rounded-2xl border border-slate-200/70 bg-white/95 p-6 shadow-lg backdrop-blur-md transition hover:border-slate-300"
              >
                <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>

                <p className="mt-3 flex-1 text-base leading-relaxed text-slate-700 font-medium">
                  {test.description?.trim() ? test.description : "Без опису"}
                </p>

                
                <Button
                  className="
                    mt-6 h-11 w-full text-base font-semibold
                    bg-slate-900 text-white
                    shadow-sm
                    transition-all duration-200
                    hover:bg-slate-800 hover:shadow-md hover:scale-[1.03]
                    active:scale-[0.99]
                    focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2
                  "
                  onClick={() => openConfirm(test.id)}
                >
                  Почати
                </Button>
              </div>
            ))}
          </div>
        )}

      
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Почати тест?"
          description={
            <>
              Ви впевнені, що хочете розпочати проходження тесту{" "}
              {selectedTest?.title ? (
                <span className="font-semibold text-slate-900">
                  “{selectedTest.title}”
                </span>
              ) : null}
              ?
            </>
          }
          warning={
            <>
              Після старту відкриється тест і почнеться відлік часу (якщо таймер
              увімкнений). <br />
              <span className="font-medium">Цю дію неможливо відмінити.</span>
            </>
          }
          cancelLabel="Скасувати"
          confirmLabel="Так, почати"
          onConfirm={onConfirm}
        />
      </div>
    </main>
  )
}