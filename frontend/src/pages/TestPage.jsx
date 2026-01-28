import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createAttempt, previewAttempt, getTestById } from "@/lib/api"
import { Trophy, AlertTriangle, XCircle, Save, ShieldCheck, Lock } from "lucide-react"
import { useAuth } from "@/auth/auth-context"

const TEST_DURATION_SEC = 10 * 60 

function formatReason(reason) {
  if (reason === "timeout") return "час вийшов"
  return "завершено"
}

function formatMMSS(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const OPTION_STYLES = [
  "bg-violet-50 border-violet-200 hover:bg-violet-100 text-slate-800",
  "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-slate-800",
  "bg-sky-50 border-sky-200 hover:bg-sky-100 text-slate-800",
  "bg-orange-50 border-orange-200 hover:bg-orange-100 text-slate-800",
]

function getPerformance(percent) {
  if (percent >= 80) {
    return {
      label: "Чудовий результат!",
      hint: "Ви добре засвоїли матеріал. Так тримати!",
      icon: Trophy,
      accentText: "text-emerald-600",
      accentBg: "bg-emerald-50",
      accentBorder: "border-emerald-200",
      barGood: "bg-emerald-500",
      barBad: "bg-rose-500",
    }
  }
  if (percent >= 50) {
    return {
      label: "Непогано, але є прогалини",
      hint: "Рекомендується повторити теми, де були помилки.",
      icon: AlertTriangle,
      accentText: "text-amber-600",
      accentBg: "bg-amber-50",
      accentBorder: "border-amber-200",
      barGood: "bg-amber-500",
      barBad: "bg-rose-500",
    }
  }
  return {
    label: "Потрібно повторити матеріал",
    hint: "Спробуйте ще раз після короткого повторення теми.",
    icon: XCircle,
    accentText: "text-rose-600",
    accentBg: "bg-rose-50",
    accentBorder: "border-rose-200",
    barGood: "bg-rose-500",
    barBad: "bg-slate-300",
  }
}

export default function TestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthed } = useAuth()

  const [test, setTest] = useState(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)

  const [answers, setAnswers] = useState({})

  const [finished, setFinished] = useState(false)
  const [finishedReason, setFinishedReason] = useState("completed")

  const [submitting, setSubmitting] = useState(false)
  const [attemptResult, setAttemptResult] = useState(null)
  const [submitError, setSubmitError] = useState("")

  
  const [saveStatus, setSaveStatus] = useState("idle") 
  const [savedAttemptId, setSavedAttemptId] = useState(null)
  const [saveHint, setSaveHint] = useState("") 

  const [remainingSec, setRemainingSec] = useState(TEST_DURATION_SEC)
  const startedAtRef = useRef(null)
  const tickRef = useRef(null)

  
  const sentOnceRef = useRef(false)
  const finalizedAnswersRef = useRef(null)
  const lastPayloadRef = useRef(null)

  useEffect(() => {
    getTestById(id).then(setTest).catch(console.error)
  }, [id])

  useEffect(() => {
    if (!test) return

    startedAtRef.current = Date.now()
    setRemainingSec(TEST_DURATION_SEC)
    setFinished(false)
    setFinishedReason("completed")
    setAttemptResult(null)
    setSubmitError("")
    setSubmitting(false)
    setCurrent(0)
    setSelected(null)
    setAnswers({})

    
    setSaveStatus("idle")
    setSavedAttemptId(null)
    setSaveHint("")
    sentOnceRef.current = false
    finalizedAnswersRef.current = null
    lastPayloadRef.current = null

    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000)
      const left = TEST_DURATION_SEC - elapsed
      setRemainingSec(Math.max(0, left))
      if (left <= 0) clearInterval(tickRef.current)
    }, 250)

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.id])

  const totalQuestions = test?.questions?.length || 0
  const question = test?.questions?.[current]

  const finalize = (reason) => {
    
    let nextAnswers = answers
    if (question && selected !== null) {
      nextAnswers = { ...answers, [question.id]: selected }
      setAnswers(nextAnswers)
      setSelected(null)
    }
    finalizedAnswersRef.current = nextAnswers

    setFinishedReason(reason)
    setFinished(true)
  }

  useEffect(() => {
    if (!test || finished) return
    if (remainingSec === 0) finalize("timeout")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSec, test, finished])

  const nextQuestion = () => {
    if (!question) return

    const nextAnswers = { ...answers, [question.id]: selected }
    setAnswers(nextAnswers)
    setSelected(null)

    if (current + 1 < totalQuestions) {
      setCurrent((prev) => prev + 1)
    } else {
      finalize("completed")
    }
  }

  
  const sendAttempt = async ({ forceSave = false } = {}) => {
    if (!test) return

    const payload = {
      test_id: Number(test.id),
      finished_reason: finishedReason,
      answers: finalizedAnswersRef.current ?? answers,
    }

    lastPayloadRef.current = payload

    
    const token = localStorage.getItem("access_token") || localStorage.getItem("access") || ""
    const guestByToken = !token

    const guest = guestByToken || !isAuthed

    setSubmitting(true)
    setSubmitError("")

    try {
      
      if (guest) {
        setSaveStatus("guest")
        setSaveHint("🔒 Гостьовий режим: результат не зберігається.")
        const res = await previewAttempt(payload)
        setAttemptResult(res)
        setSavedAttemptId(null)
        return
      }

      setSaveStatus("saving")
      setSaveHint("Збереження результату в акаунт…")

      
      if (saveStatus === "saved" && savedAttemptId && !forceSave) {
        setSaveHint("✅ Результат уже збережено в акаунті.")
        return
      }

      const res = await createAttempt(payload)
      setAttemptResult(res)

      const attemptId = res?.attempt_id || res?.id || null
      setSavedAttemptId(attemptId)
      setSaveStatus("saved")
      setSaveHint("✅ Результат збережено в акаунті.")
    } catch (e) {
      console.error(e)
      const guest = !isAuthed
      setSubmitError(
        guest
          ? "Не вдалося отримати результат. Перевір /api/attempts/preview/"
          : "Не вдалося зберегти результат. Перевір /api/attempts/"
      )
      setSaveStatus(guest ? "guest" : "idle")
      setSaveHint("")
    } finally {
      setSubmitting(false)
    }
  }

  
  useEffect(() => {
    if (!finished || !test) return

    if (tickRef.current) clearInterval(tickRef.current)

    if (sentOnceRef.current) return
    sentOnceRef.current = true

    
    sendAttempt().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const resultMap = useMemo(() => {
    const map = {}
    if (!attemptResult?.results) return map
    for (const r of attemptResult.results) map[r.question_id] = r
    return map
  }, [attemptResult])

  const elapsedSec = useMemo(() => {
    if (!startedAtRef.current) return 0
    const raw = Math.floor((Date.now() - startedAtRef.current) / 1000)
    if (finished) return Math.max(0, TEST_DURATION_SEC - remainingSec)
    return Math.max(0, raw)
  }, [finished, remainingSec])

  
  useEffect(() => {
    if (!test) return
    if (finished) {
      window.onbeforeunload = null
      return
    }
    window.onbeforeunload = () => "Тест ще триває. Ви впевнені, що хочете вийти?"
    return () => {
      window.onbeforeunload = null
    }
  }, [test, finished])

  if (!test) {
    return <div className="p-6">Завантаження тесту...</div>
  }

  if (finished) {
    const score = attemptResult?.score ?? 0
    const total = attemptResult?.total ?? totalQuestions
    const percent = attemptResult?.percent ?? 0
    const reason = attemptResult?.finished_reason ?? finishedReason

    const correct = score
    const wrong = Math.max(0, total - correct)
    const avgPerQuestion = total > 0 ? elapsedSec / total : 0

    const perf = getPerformance(percent)
    const PerfIcon = perf.icon

    const isGuestView = saveStatus === "guest" || (!isAuthed && !savedAttemptId)

    return (
      <main className="relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-blue-50 to-sky-100" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-48 -right-48 h-[520px] w-[520px] rounded-full bg-fuchsia-500/15 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
          <div className="mb-6 flex flex-col gap-2">
            <div className="text-sm text-slate-600">{test.title}</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Вітаємо,ви пройши тестування!
            </h1>

            <div
              className={`mt-2 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${perf.accentBg} ${perf.accentBorder} ${perf.accentText}`}
            >
              <PerfIcon className="h-4 w-4" />
              {perf.label}
            </div>
            <div className="text-slate-600">{perf.hint}</div>
          </div>

          <Card className="rounded-2xl border-white/10 bg-white/95 shadow-xl">
            <CardContent className="p-8">
              
              {(saveHint || saveStatus === "saved" || saveStatus === "guest") && (
                <div
                  className={`mb-4 rounded-xl border p-4 text-sm ${
                    isGuestView
                      ? "border-slate-200 bg-slate-50 text-slate-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isGuestView ? (
                      <Lock className="mt-0.5 h-5 w-5" />
                    ) : (
                      <ShieldCheck className="mt-0.5 h-5 w-5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">
                        {isGuestView ? "Гостьовий режим" : "Акаунт (збережено)"}
                      </div>
                      <div className="mt-1">
                        {saveHint ||
                          (isGuestView
                            ? "Результат показано на екрані, але він не зберігається."
                            : "Результат збережено у вашому акаунті.")}
                      </div>
                      {!isGuestView && savedAttemptId && (
                        <div className="mt-2 text-xs text-emerald-700">
                          ID спроби: <span className="font-semibold">{savedAttemptId}</span>
                        </div>
                      )}

                      
                      {!isGuestView && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline" onClick={() => navigate("/results")}>
                            📊 Перейти до моїх результатів
                          </Button>
                        </div>
                      )}
                    </div>

                    
                    {isGuestView ? (
                      <Button variant="outline" className="shrink-0" onClick={() => navigate("/login")}>
                        <Save className="mr-2 h-4 w-4" />
                        Увійти, щоб зберегти
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="shrink-0"
                        disabled={saveStatus === "saving" || saveStatus === "saved"}
                        onClick={() => sendAttempt({ forceSave: true })}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {saveStatus === "saved"
                          ? "Збережено ✅"
                          : saveStatus === "saving"
                          ? "Збереження…"
                          : "Зберегти"}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {submitting && (
                <div className="rounded-xl border bg-white p-4 text-slate-700">
                  Збереження результату...
                </div>
              )}

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {submitError}
                </div>
              )}

              {!submitting && !submitError && attemptResult && (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-white p-4">
                      <div className="text-sm text-slate-500">Сума балів</div>
                      <div className="mt-1 text-3xl font-bold text-slate-900">
                        {score} <span className="text-slate-400">/ {total}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-white p-4">
                      <div className="text-sm text-slate-500">Результат</div>
                      <div className={`mt-1 text-3xl font-bold ${perf.accentText}`}>
                        {percent}%
                      </div>
                    </div>

                    <div className="rounded-xl border bg-white p-4">
                      <div className="text-sm text-slate-500">Причина завершення</div>
                      <div className="mt-1 text-base font-semibold text-slate-900">
                        {formatReason(reason)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border bg-white p-6">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-base font-bold text-slate-900">
                        Точність
                      </div>
                      <div className="text-sm text-slate-500">
                        Правильних:{" "}
                        <span className="font-semibold text-slate-900">{correct}</span> ·
                        Помилок:{" "}
                        <span className="font-semibold text-slate-900">{wrong}</span>
                      </div>
                    </div>

                    <div className="h-4 w-full overflow-hidden rounded-full border bg-slate-100">
                      <div className="flex h-full w-full">
                        <div
                          className={`${perf.barGood} h-full transition-all duration-700`}
                          style={{ width: `${percent}%` }}
                        />
                        <div
                          className={`${perf.barBad} h-full transition-all duration-700`}
                          style={{ width: `${100 - percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border bg-slate-50 p-4 text-center">
                        <div className="text-3xl font-bold text-slate-900">{correct}</div>
                        <div className="text-sm font-medium text-slate-600">
                          правильних
                        </div>
                      </div>
                      <div className="rounded-xl border bg-slate-50 p-4 text-center">
                        <div className="text-3xl font-bold text-slate-900">{wrong}</div>
                        <div className="text-sm font-medium text-slate-600">
                          неправильних
                        </div>
                      </div>
                      <div className="rounded-xl border bg-slate-50 p-4 text-center">
                        <div className="text-3xl font-bold text-slate-900">0</div>
                        <div className="text-sm font-medium text-slate-600">
                          пропущено
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border bg-slate-50 px-6 py-4 text-center">
                        <div className="text-slate-700">
                          Всього часу{" "}
                          <span className="font-bold text-amber-600">
                            {elapsedSec} сек
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl border bg-slate-50 px-6 py-4 text-center">
                        <div className="text-slate-700">
                          Ср. час / запитання{" "}
                          <span className="font-bold text-amber-600">
                            {avgPerQuestion.toFixed(1)} сек
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button variant="outline" onClick={() => navigate("/catalog")}>
                        До каталогу
                      </Button>
                      <Button onClick={() => window.location.reload()}>
                        Спробувати ще раз
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              Ознайомитися з відповідями
            </h2>

            <div className="space-y-4">
              {test.questions.map((q, idx) => {
                const r = resultMap[q.id]
                const selectedId = r?.selected_choice_id ?? answers[q.id]
                const correctId = r?.correct_choice_id

                return (
                  <Card key={q.id} className="rounded-2xl bg-white/95 shadow-lg">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-slate-50 text-sm font-semibold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-base font-semibold text-slate-900">
                            {q.text}
                          </div>
                          {r && (
                            <div className="mt-1 text-sm font-medium">
                              {r.is_correct ? (
                                <span className="text-emerald-700">✔ Правильно</span>
                              ) : (
                                <span className="text-rose-700">✖ Неправильно</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {q.choices.map((c) => {
                          const isSelected = c.id === selectedId
                          const isCorrect = c.id === correctId

                          let cls =
                            "w-full rounded-xl border p-4 text-left bg-white text-base"
                          if (isCorrect) cls += " border-emerald-500 bg-emerald-50"
                          if (isSelected && !isCorrect) cls += " border-rose-500 bg-rose-50"
                          if (isSelected && isCorrect) cls += " ring-2 ring-emerald-500"

                          return (
                            <div key={c.id} className={cls}>
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-slate-900">{c.text}</div>
                                <div className="text-xs text-slate-600">
                                  {isCorrect ? "Правильна" : ""}
                                  {isSelected ? (isCorrect ? " • Ваша" : "Ваша") : ""}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="sticky top-0 z-20 w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold text-slate-900">
              {current + 1} / {totalQuestions}
            </div>
            <div className="hidden sm:block text-sm text-slate-500">{test.title}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1 shadow-sm">
              <span className="text-base">⏱</span>
              <span
                className={
                  remainingSec <= 60
                    ? "text-lg font-bold text-red-600"
                    : "text-lg font-bold text-slate-900"
                }
              >
                {formatMMSS(remainingSec)}
              </span>
            </div>

            <button
              onClick={() => {
                const ok = window.confirm(
                  "Ви впевнені, що хочете вийти з тесту?\nРезультат буде зафіксовано за поточними відповідями."
                )
                if (ok) finalize("completed")
              }}
              className="grid h-10 w-10 place-items-center rounded-full border bg-white text-xl text-slate-700 shadow-sm hover:bg-slate-50"
              title="Вийти"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto max-w-4xl text-3xl font-semibold leading-snug text-slate-800">
            {question.text}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {question.choices.map((choice, idx) => {
            const base = OPTION_STYLES[idx % OPTION_STYLES.length]
            const isPicked = selected === choice.id

            return (
              <button
                key={choice.id}
                onClick={() => setSelected(choice.id)}
                className={`
                  w-full rounded-3xl border p-7 text-center text-xl font-semibold shadow-sm transition
                  ${base}
                  ${isPicked ? "ring-4 ring-slate-900/10 scale-[1.01]" : ""}
                `}
              >
                {choice.text}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="h-12 px-10 text-base"
            onClick={nextQuestion}
            disabled={selected === null}
          >
            {current + 1 < totalQuestions ? "Далі" : "Завершити"}
          </Button>
        </div>

        <div className="mt-2 text-center text-sm text-slate-500">
          Якщо час закінчиться — тест завершиться автоматично і зафіксуються поточні відповіді.
        </div>
      </div>
    </div>
  )
}