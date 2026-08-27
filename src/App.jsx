import { useMemo, useState } from "react"

const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Dart: "#00B4AB",
  Jupyter: "#DA5B0B",
}
const langColor = (l) => LANG_COLORS[l] || "#8b949e"

function timeAgo(dateStr) {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const day = 86400000
  const units = [
    [365 * day, "y"],
    [30 * day, "mo"],
    [7 * day, "w"],
    [day, "d"],
    [3600000, "h"],
    [60000, "m"],
  ]
  for (const [ms, label] of units) {
    if (diff >= ms) return `${Math.floor(diff / ms)}${label} ago`
  }
  return "just now"
}

const SUGGESTIONS = ["torvalds", "gaearon", "sindresorhus"]

const App = () => {
  const [user, setUser] = useState("")
  const [query, setQuery] = useState("")
  const [data, setData] = useState(null)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sort, setSort] = useState("updated")

  async function getUser(name) {
    const target = (name ?? user).trim()
    if (!target) {
      setError("This field can't be left empty")
      return
    }
    setLoading(true)
    setError("")
    try {
      const [res1, res2] = await Promise.all([
        fetch(`https://api.github.com/users/${target}`),
        fetch(`https://api.github.com/users/${target}/repos?per_page=100`),
      ])
      if (!res1.ok || !res2.ok) {
        setError(`No GitHub user found for "${target}"`)
        setData(null)
        setRepos([])
        return
      }
      const userResponse = await res1.json()
      const repoResponse = await res2.json()
      setData(userResponse)
      setRepos(Array.isArray(repoResponse) ? repoResponse : [])
      setQuery(target)
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    getUser()
  }

  const sortedRepos = useMemo(() => {
    const list = [...repos]
    if (sort === "stars") list.sort((a, b) => b.stargazers_count - a.stargazers_count)
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name))
    else list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    return list
  }, [repos, sort])

  const hasResult = !!data && !error

  return (
    <div className="min-h-screen bg-dot-grid">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <header className="mb-8 flex items-center gap-3 sm:mb-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <svg viewBox="0 0 16 16" width="18" height="18" fill="var(--text)">
              <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.7-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 8 0" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-sm font-semibold tracking-tight text-white sm:text-base">git-explorer</p>
            <p className="text-xs text-[var(--muted)]">a small window into a GitHub profile</p>
          </div>
        </header>

        {/* Terminal search card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border shadow-2xl shadow-black/40"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-1.5 border-b px-4 py-3" style={{ borderColor: "var(--border-soft)" }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#f85149" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#d29922" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#3fb950" }} />
            <span className="ml-3 font-mono text-xs text-[var(--muted)]">explorer.sh</span>
          </div>

          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
            <label htmlFor="username" className="flex flex-1 items-center gap-2 font-mono text-sm">
              <span style={{ color: "var(--green)" }}>$</span>
              <span className="text-[var(--muted)]">explore</span>
              <span className="relative flex-1">
                <input
                  id="username"
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="username"
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full bg-transparent text-white placeholder-[var(--muted-2)] outline-none"
                />
              </span>
              <span className="cursor-blink hidden text-[var(--violet)] sm:inline">▍</span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="font-mono text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "var(--violet)", color: "#fff" }}
            >
              {loading ? "running…" : "run →"}
            </button>
          </div>

          {!hasResult && !loading && !error && (
            <div className="border-t px-4 py-3 font-mono text-xs text-[var(--muted)] sm:px-5" style={{ borderColor: "var(--border-soft)" }}>
              try{" "}
              {SUGGESTIONS.map((s, i) => (
                <span key={s}>
                  <button
                    type="button"
                    onClick={() => { setUser(s); getUser(s) }}
                    className="text-[var(--violet)] underline decoration-dotted underline-offset-2 hover:text-white"
                  >
                    {s}
                  </button>
                  {i < SUGGESTIONS.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          )}

          {error && (
            <div className="border-t px-4 py-3 font-mono text-xs sm:px-5" style={{ borderColor: "var(--border-soft)", color: "var(--red)" }}>
              error: {error}
            </div>
          )}
        </form>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
            <div className="h-52 animate-pulse rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }} />
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {hasResult && !loading && (
          <div className="animate-rise mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr] lg:items-start">
            {/* Profile card */}
            <div className="rounded-xl border p-5 lg:sticky lg:top-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <img
                src={data.avatar_url}
                alt={data.login}
                className="h-20 w-20 rounded-full border-2"
                style={{ borderColor: "var(--border)" }}
              />
              <p className="mt-4 text-lg font-semibold text-white">{data.name || data.login}</p>
              <p className="font-mono text-sm" style={{ color: "var(--violet)" }}>@{data.login}</p>
              {data.bio && <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{data.bio}</p>}

              <div className="mt-4 flex gap-4 border-t pt-4 font-mono text-sm" style={{ borderColor: "var(--border-soft)" }}>
                <div>
                  <p className="font-semibold text-white">{data.followers ?? 0}</p>
                  <p className="text-xs text-[var(--muted)]">followers</p>
                </div>
                <div>
                  <p className="font-semibold text-white">{data.following ?? 0}</p>
                  <p className="text-xs text-[var(--muted)]">following</p>
                </div>
                <div>
                  <p className="font-semibold text-white">{data.public_repos ?? repos.length}</p>
                  <p className="text-xs text-[var(--muted)]">repos</p>
                </div>
              </div>

              {data.html_url && (
                <a
                  href={data.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block w-full rounded-lg border py-2 text-center text-sm font-medium text-white transition-colors hover:border-[var(--violet)]"
                  style={{ borderColor: "var(--border)" }}
                >
                  view on GitHub ↗
                </a>
              )}
            </div>

            {/* Repo list */}
            <div>
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--muted)]">
                  {repos.length} {repos.length === 1 ? "repository" : "repositories"}
                </p>
                <div className="flex gap-1 font-mono text-xs">
                  {[
                    ["updated", "recent"],
                    ["stars", "stars"],
                    ["name", "name"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSort(key)}
                      className="rounded-md px-2 py-1 transition-colors"
                      style={{
                        color: sort === key ? "#fff" : "var(--muted)",
                        background: sort === key ? "var(--surface-2)" : "transparent",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {repos.length === 0 ? (
                <div className="rounded-xl border p-8 text-center font-mono text-sm text-[var(--muted)]" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  no public repositories to show
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {sortedRepos.map((repo) => (
                    <li key={repo.id}>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="group block rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--violet)] hover:shadow-lg hover:shadow-black/30"
                        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <p className="font-mono text-sm font-medium text-white group-hover:text-[var(--violet)]">
                            {repo.name}
                          </p>
                          {repo.fork && (
                            <span className="rounded-full border px-2 py-0.5 text-[10px] text-[var(--muted)]" style={{ borderColor: "var(--border)" }}>
                              fork
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{repo.description}</p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[var(--muted)]">
                          {repo.language && (
                            <span className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: langColor(repo.language) }} />
                              {repo.language}
                            </span>
                          )}
                          <span style={{ color: "var(--yellow)" }}>★ {repo.stargazers_count}</span>
                          <span>⑂ {repo.forks_count}</span>
                          {repo.updated_at && <span>updated {timeAgo(repo.updated_at)}</span>}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <footer className="mt-14 text-center font-mono text-xs text-[var(--muted-2)]">
          powered by the GitHub REST API
        </footer>
      </div>
    </div>
  )
}

export default App
