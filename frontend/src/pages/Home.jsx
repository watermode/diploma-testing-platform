import { useNavigate } from "react-router-dom"
import heroImg from "@/assets/hero.jpg"
import { Check } from "lucide-react"

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="w-full">
      
      <section className="relative overflow-hidden">
        
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />

          
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `url(${heroImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          
          <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-sky-400/20 blur-3xl" />

          
          <div
            className="absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Онлайн-тестування студентів
              </div>

              <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
                Перевір знання{" "}
                <span className="text-indigo-200">за 10 хв</span>{" "}
                і отримай результат !
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl">
                Платформа для швидкої самоперевірки з програмування та ІТ.
                Після тесту — <b>бали</b>, <b>відсоток</b> та{" "}
                <b>перегляд правильних відповідей</b>.
              </p>

              
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate("/catalog")}
                  className="h-14 rounded-2xl bg-white px-8 text-base font-extrabold text-slate-900 shadow-xl shadow-indigo-500/25 transition
                             hover:-translate-y-[1px] hover:shadow-2xl active:translate-y-0"
                >
                  Переглянути тести та розпопочати тестування →

                </button>
              </div>

              
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <InfoPill
                  title="Предмети"
                  items={["React", "JS", "Python", "C++", "ООП", "HTML/CSS"]}
                />
                <InfoPill title="Формат" items={["10 питань", "таймер 10 хв"]} />
                <InfoPill title="Після тесту" items={["бали", "%", "відповіді"]} />
              </div>
            </div>

            
            <div className="relative">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                <div className="rounded-2xl bg-white p-6 shadow-2xl">
                  
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="font-semibold">
                      JavaScript — Питання <b>3</b> з <b>10</b>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2">
                      <span>⏱️</span>
                      <span className="font-extrabold text-slate-900">09:42</span>
                    </div>
                  </div>

                  
                  <div className="mt-4 rounded-2xl border bg-slate-50 p-5">
                    <div className="text-lg font-extrabold text-slate-900">
                      Що повертає метод <span className="font-black">map()</span>?
                    </div>
                  </div>

                  
                  <div className="mt-5 space-y-2">
                    <ChoiceLikeYourTest active>A) Новий масив</ChoiceLikeYourTest>
                    <ChoiceLikeYourTest>B) Один елемент</ChoiceLikeYourTest>
                    <ChoiceLikeYourTest>C) Об’єкт</ChoiceLikeYourTest>
                    <ChoiceLikeYourTest>D) undefined</ChoiceLikeYourTest>
                  </div>

                  <button
                    className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-extrabold text-white transition
                               hover:bg-slate-800 active:scale-[0.99]"
                  >
                    Далі
                  </button>

                  <div className="mt-3 text-center text-xs font-semibold text-slate-500">
                    Якщо час закінчиться — тест завершиться автоматично
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-indigo-500/15 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Про платформу
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-base text-slate-600 sm:text-lg">
            TestPlatform — це навчальна онлайн-платформа для перевірки знань із програмування.
            Вона підходить студентам для самопідготовки та швидкої перевірки тем перед
            контрольними/заліками або співбесідами.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Feature
              title="Швидкий старт"
              text="Обирай предмет у каталозі — та проходь тест одразу. Мінімум зайвих кроків."
            />
            <Feature
              title="Чесне оцінювання"
              text="Перевірка на сервері. Після завершення бачиш бали, відсоток і розбір відповідей."
            />
            <Feature
              title="Таймер 10 хв"
              text="Є обмеження часу. Якщо не встиг — результат фіксується за відповіді, які вже обрав."
            />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border bg-slate-50 p-6">
              <div className="text-xl font-extrabold text-slate-900">
                Що ти отримаєш після проходження?
              </div>
              <ul className="mt-4 space-y-2 text-slate-700">
                <li className="flex gap-2">
                  <span className="font-black">✓</span> Підсумок: <b>скільки правильних / неправильних</b>
                </li>
                <li className="flex gap-2">
                  <span className="font-black">✓</span> Відсоток: <b>точність у %</b>
                </li>
                <li className="flex gap-2">
                  <span className="font-black">✓</span> Перегляд відповідей: <b>пояснення що правильно</b>
                </li>
                <li className="flex gap-2">
                  <span className="font-black">✓</span> Час: <b>загальний та середній на питання</b>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border bg-slate-50 p-6">
              <div className="text-xl font-extrabold text-slate-900">
                Для кого ця платформа?
              </div>
              <p className="mt-4 text-slate-700">
                Для студентів, початківців та всіх, хто хоче швидко перевірити знання
                з базових тем: ООП, JavaScript, Python, C++, React, HTML/CSS.
                Тести короткі, зрозумілі й допомагають виявити слабкі місця.
              </p>

              <div className="mt-6">
                <button
                  onClick={() => navigate("/catalog")}
                  className="h-12 rounded-2xl bg-slate-900 px-6 text-sm font-extrabold text-white transition hover:bg-slate-800 active:scale-[0.99]"
                >
                  Перейти до каталогу
                </button>
              </div>
            </div>
          </div>

          
          <div className="mt-14">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Часті питання
            </h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Faq
                q="Скільки часу дається на тест?"
                a="На кожен тест — 10 хвилин. Таймер показується під час проходження."
              />
              <Faq
                q="Що буде, якщо час закінчиться?"
                a="Тест завершується автоматично, а результат зберігається по вже обраних відповідях."
              />
              <Faq
                q="Чи можна переглянути правильні відповіді?"
                a="Так, після завершення тесту відкривається сторінка з результатом і розбором."
              />
              <Faq
                q="Скільки питань у тесті?"
                a="Стандартно 10 питань на кожен предмет."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}



function InfoPill({ title, items = [] }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-200/90">
        {title}
      </div>

      <ul className="mt-2 space-y-1.5">
        {items.map((it) => (
          <li
            key={it}
            className="flex items-center gap-2 text-sm font-semibold text-white/90"
          >
            <Check className="h-4 w-4 opacity-90" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Feature({ title, text }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="text-xl font-extrabold text-slate-900">{title}</div>
      <div className="mt-2 text-base text-slate-600">{text}</div>
    </div>
  )
}

function Faq({ q, a }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="text-base font-extrabold text-slate-900">{q}</div>
      <div className="mt-2 text-sm text-slate-600">{a}</div>
    </div>
  )
}

function ChoiceLikeYourTest({ children, active }) {
  return (
    <div
      className={[
        "w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
        active
          ? "border-slate-900 bg-slate-100"
          : "bg-white hover:bg-slate-50 border-slate-200",
      ].join(" ")}
    >
      {children}
    </div>
  )
}