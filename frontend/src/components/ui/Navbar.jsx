import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import {
  Headset,
  LogIn,
  LayoutGrid,
  LogOut,
  User as UserIcon,
  ClipboardList,
} from "lucide-react"
import { useAuth } from "@/auth/auth-context"

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthed, signOut, authLoading } = useAuth()

  const phone = "+380976698090"
  const email = "smatkopraktika@gmail.com"

  const [copied, setCopied] = useState("")
  const [openSupport, setOpenSupport] = useState(false)

  
  const [openLogout, setOpenLogout] = useState(false)

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value)
    setCopied("Скопійовано в буфер обміну")
    window.clearTimeout(copyToClipboard._t)
    copyToClipboard._t = window.setTimeout(() => setCopied(""), 2000)
  }

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")

  const navBtnBase =
    "h-10 px-4 text-sm font-semibold rounded-lg transition-all duration-200 " +
    "bg-slate-100 text-slate-900 border border-slate-200 " +
    "hover:bg-slate-200 hover:shadow-sm hover:scale-[1.03] active:scale-[0.99]"

  const navBtnActive = "bg-slate-200 border-slate-300 shadow-sm"

  const confirmLogout = () => {
    setOpenLogout(false)
    signOut()
    navigate("/", { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/85 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate("/")}
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white font-bold">
            TP
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-slate-900">TestPlatform</div>
            <div className="text-xs text-slate-500">Онлайн тестування студентів</div>
          </div>
        </div>

      
        <nav className="flex items-center gap-2">
          
          <Button
            variant="ghost"
            className={`${navBtnBase} ${isActive("/catalog") ? navBtnActive : ""}`}
            onClick={() => navigate("/catalog")}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Каталог тестів
          </Button>

          
          {!authLoading && isAuthed && (
            <Button
              variant="ghost"
              className={`${navBtnBase} ${isActive("/results") ? navBtnActive : ""}`}
              onClick={() => navigate("/results")}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Мої результати
            </Button>
          )}

      
          <Dialog
            open={openSupport}
            onOpenChange={(v) => {
              setOpenSupport(v)
              if (!v) setCopied("")
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className={`${navBtnBase} ${openSupport ? navBtnActive : ""}`}
              >
                <Headset className="mr-2 h-4 w-4" />
                Техпідтримка
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                  <Headset className="h-6 w-6 text-indigo-600" />
                  Технічна підтримка
                </DialogTitle>

                <DialogDescription className="mt-3 text-base text-slate-700">
                  Якщо виникли проблеми з проходженням тесту — звʼяжіться з нами будь-яким зручним способом.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">📞 Телефон</div>
                  <div className="text-lg font-semibold text-slate-900">{phone}</div>
                  <div className="mt-2 text-xs text-slate-500">Пн–Пт, 09:00–18:00</div>

                  <Button variant="outline" className="mt-3" onClick={() => copyToClipboard(phone)}>
                    Скопіювати номер
                  </Button>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">📧 Email</div>
                  <div className="text-lg font-semibold text-slate-900">{email}</div>

                  <Button variant="outline" className="mt-3" onClick={() => copyToClipboard(email)}>
                    Скопіювати email
                  </Button>
                </div>

                {copied && (
                  <div className="text-center text-sm font-medium text-emerald-600">
                    {copied}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          
          {authLoading ? (
            <Button variant="ghost" className={`${navBtnBase} ml-2`} disabled>
              <UserIcon className="mr-2 h-4 w-4" />
              ...
            </Button>
          ) : isAuthed ? (
            <>
              <Button
                variant="ghost"
                className={`${navBtnBase} ml-2`}
                onClick={() => setOpenLogout(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Вихід ({user?.username})
              </Button>

              <Dialog open={openLogout} onOpenChange={setOpenLogout}>
                <DialogContent className="sm:max-w-lg rounded-2xl px-6 py-6">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-600">
                        ⚠️
                      </span>
                      Підтвердіть вихід
                    </DialogTitle>

                    <DialogDescription className="mt-4 text-base leading-relaxed text-slate-700">
                      Ви дійсно хочете <b>вийти з акаунта</b>?
                      <br />
                      <span className="text-slate-500">
                        Щоб ваші результати тестів зберігались, потрібно буде увійти знову.
                      </span>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setOpenLogout(false)}>
                      Скасувати
                    </Button>

                    <Button
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={confirmLogout}
                    >
                      Вийти
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Button
              variant="ghost"
              className={`${navBtnBase} ${isActive("/login") ? navBtnActive : ""} ml-2`}
              onClick={() => navigate("/login")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Вхід
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}