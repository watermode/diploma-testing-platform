import { useEffect, useMemo, useState } from "react"
import { getMe, logout as apiLogout } from "@/lib/api"
import { AuthContext } from "@/auth/auth-context"

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function bootstrap() {
      try {
        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("access") ||
          ""

        if (!token) {
          if (alive) setUser(null)
          return
        }

        const me = await getMe()
        if (alive) setUser(me)
      } catch {
        apiLogout()
        if (alive) setUser(null)
      } finally {
        if (alive) setAuthLoading(false)
      }
    }

    bootstrap()
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      setUser,
      authLoading,
      isAuthed: Boolean(user),
      signOut: () => {
        apiLogout()
        setUser(null)
      },
    }),
    [user, authLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}