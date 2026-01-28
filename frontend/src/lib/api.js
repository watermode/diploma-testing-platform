import axios from "axios"

const DEBUG = String(import.meta.env.VITE_API_DEBUG || "").toLowerCase() === "true"

function normalizeApiUrl(raw) {
  let base = String(raw || "").trim().replace(/\/+$/, "")
  if (!base) base = "http://127.0.0.1:8000"
  if (!/\/api(\/|$)/.test(base)) base += "/api"
  return base
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL)

function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("access") ||
    sessionStorage.getItem("token") ||
    ""
  )
}

function getRefreshToken() {
  return (
    localStorage.getItem("refresh_token") ||
    localStorage.getItem("refresh") ||
    sessionStorage.getItem("refresh_token") ||
    sessionStorage.getItem("refresh") ||
    ""
  )
}

function clearTokens() {
  ;["access_token", "refresh_token", "access", "refresh", "token"].forEach((k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
}

export function setTokens({ access, refresh, token } = {}) {
  const a = access || token || ""
  const r = refresh || ""

  if (a) {
    localStorage.setItem("access_token", a)
    localStorage.setItem("access", a)
  }
  if (r) {
    localStorage.setItem("refresh_token", r)
    localStorage.setItem("refresh", r)
  }
}

function toApiError(err) {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const data = err.response?.data

    let message = ""
    if (typeof data === "string") message = data
    else if (data?.detail) message = data.detail
    else if (data?.message) message = data.message
    else if (data != null) {
      try {
        message = JSON.stringify(data)
      } catch {
        message = String(data)
      }
    }

    const e = new Error(
      message || err.message || (status ? `Request failed: ${status}` : "Network error")
    )
    e.status = status
    e.data = data
    throw e
  }
  throw err
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  if (!config.skipAuth) {
    const token = getAccessToken()
    if (token) {
      config.headers = config.headers ?? {}
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  }

  if (DEBUG) {
    const fullUrl = `${config.baseURL}${config.url}`
    const hasAuth = Boolean(config.headers?.Authorization)
    console.log("[API]", (config.method || "GET").toUpperCase(), fullUrl, "auth:", hasAuth)
  }

  return config
})

let refreshPromise = null

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error("No refresh token")

  const res = await api.post("/auth/refresh/", { refresh }, { skipAuth: true })
  const access = res.data?.access
  if (!access) throw new Error("Refresh failed: no access")

  setTokens({ access })
  return access
}


api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (DEBUG) {
      console.warn("[API ERROR]", err.response?.status, err.config?.url, err.response?.data)
    }

    const status = err.response?.status
    const original = err.config

    
    if (status === 401 && original && !original._retry && !original.skipAuth) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const newAccess = await refreshPromise
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${newAccess}`
        return api.request(original)
      } catch (e) {
        clearTokens()
        return Promise.reject(e)
      }
    }

    if (status === 401) clearTokens()
    return Promise.reject(err)
  }
)

async function request(method, path, { data, params, headers, skipAuth } = {}) {
  try {
    const res = await api.request({ method, url: path, data, params, headers, skipAuth })
    return res.data ?? null
  } catch (err) {
    toApiError(err)
  }
}

export async function getTests() {
  return request("GET", "/tests/")
}

export async function getTestById(id) {
  return request("GET", `/tests/${id}/`)
}

function normalizeAttemptPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("attempt payload is required")
  }

  const { test_id, finished_reason = "completed" } = payload
  let answers = payload.answers ?? {}

  if (Array.isArray(answers)) {
    const dict = {}
    for (const item of answers) {
      if (!item) continue
      const q = item.question ?? item.question_id
      const c = item.choice ?? item.choice_id
      if (q != null && c != null) dict[String(q)] = c
    }
    answers = dict
  }

  if (answers == null || typeof answers !== "object" || Array.isArray(answers)) {
    answers = {}
  }

  return { test_id: Number(test_id), finished_reason, answers }
}

export async function previewAttempt(payload) {
  const body = normalizeAttemptPayload(payload)
  return request("POST", "/attempts/preview/", {
    data: body,
    headers: { "Content-Type": "application/json" },
    skipAuth: true,
  })
}

export async function createAttempt(payload) {
  const body = normalizeAttemptPayload(payload)
  return request("POST", "/attempts/", {
    data: body,
    headers: { "Content-Type": "application/json" },
  })
}

export async function saveAttempt(payload) {
  return createAttempt(payload)
}

export async function getMyAttempts() {
  return request("GET", "/attempts/my/")
}

export async function register(data) {
  return request("POST", "/auth/register/", {
    data: data ?? {},
    headers: { "Content-Type": "application/json" },
    skipAuth: true,
  })
}

export async function login(data) {
  const res = await request("POST", "/auth/login/", {
    data: data ?? {},
    headers: { "Content-Type": "application/json" },
    skipAuth: true,
  })

  const access = res?.access || ""
  const refresh = res?.refresh || ""
  setTokens({ access, refresh })
  return res
}

export async function logout() {
  clearTokens()
}

export async function getMe() {
  return request("GET", "/auth/me/")
}

export { api }