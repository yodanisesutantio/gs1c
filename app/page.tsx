"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Gamepad2,
  LoaderCircle,
  Search,
  RotateCcw,
  Trophy,
  LockKeyhole,
} from "lucide-react";
import {
  checklist,
  TOTAL_OBJECTIVES,
  type ChecklistCategory,
  type ChecklistItem,
} from "@/lib/checklist";

type CheckedState = Record<string, boolean>;

function allItems(items: ChecklistItem[]): ChecklistItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? allItems(item.children) : []),
  ]);
}

function itemComplete(item: ChecklistItem, checked: CheckedState): boolean {
  if (item.children?.length)
    return (
      checked[item.id] === true ||
      item.children.every((child) => itemComplete(child, checked))
    );
  return checked[item.id] === true;
}

function categoryCompleteCount(
  category: ChecklistCategory,
  checked: CheckedState,
) {
  return category.items.filter((item) => itemComplete(item, checked)).length;
}

export default function Home() {
  const [checked, setChecked] = useState<CheckedState>({});
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    collectibles: true,
    story: true,
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState("");

  type AuthStatus = "checking" | "locked" | "unlocked";

  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data: { authenticated: boolean }) => {
        if (!cancelled) {
          setAuthStatus(data.authenticated ? "unlocked" : "locked");
        }
      })
      .catch(() => {
        if (!cancelled) setAuthStatus("locked");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authStatus !== "unlocked") return;

    let cancelled = false;

    fetch("/api/progress", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load progress");
        }

        return response.json();
      })
      .then((data: { checked?: CheckedState; updatedAt?: string | null }) => {
        if (cancelled) return;

        setChecked(data.checked ?? {});
        setSavedAt(data.updatedAt ?? null);
        setError("");
      })
      .catch(() => {
        if (!cancelled) {
          setError("Progress could not be loaded from the JSON file.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  const save = useCallback(async (next: CheckedState) => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: next }),
      });
      if (!response.ok) throw new Error("Save failed");
      const data = (await response.json()) as { updatedAt?: string | null };
      setSavedAt(data.updatedAt ?? null);
    } catch {
      setError(
        "Save failed. Check that the server can write to data/gta-sa-progress.json.",
      );
    } finally {
      setSaving(false);
    }
  }, []);

  const creditItems = useMemo(
    () =>
      checklist
        .flatMap((category) => category.items)
        .filter((item) => item.credit !== false),
    [],
  );
  const completedObjectives = creditItems.filter((item) =>
    itemComplete(item, checked),
  ).length;
  const percentage = Math.min(
    100,
    (completedObjectives / TOTAL_OBJECTIVES) * 100,
  );
  const visibleCategories = useMemo(
    () =>
      checklist.filter((category) => {
        const categoryMatches =
          activeCategory === "all" || category.id === activeCategory;
        const searchMatches =
          !query ||
          allItems(category.items).some((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()),
          );
        return categoryMatches && searchMatches;
      }),
    [activeCategory, query],
  );
  const totalTasks = checklist.reduce(
    (total, category) => total + allItems(category.items).length,
    0,
  );
  const completedTasks = Object.values(checked).filter(Boolean).length;

  const updateItem = (item: ChecklistItem, value: boolean) => {
    const next = { ...checked, [item.id]: value };
    if (item.children) {
      for (const child of allItems(item.children)) next[child.id] = value;
    }
    setChecked(next);
    void save(next);
  };

  const setCategory = (category: ChecklistCategory, value: boolean) => {
    const next = { ...checked };
    for (const item of allItems(category.items)) next[item.id] = value;
    setChecked(next);
    void save(next);
  };

  const reset = () => {
    if (!window.confirm("Reset every checkbox? This cannot be undone.")) return;
    setChecked({});
    void save({});
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error ?? "Invalid username or password.");
        return;
      }

      setPassword("");
      setAuthStatus("unlocked");
    } catch {
      setAuthError("Unable to connect. Please try again.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <>
      <main
        className={`page-shell ${authStatus !== "unlocked" ? "page-locked" : ""}`}
        aria-hidden={authStatus !== "unlocked"}
      >
        <header className="topbar">
          <a className="brand" href="#top">
            <span className="brand-icon">
              <Gamepad2 size={21} />
            </span>
            <span>
              100% <b>SAN ANDREAS</b>
            </span>
          </a>
          <div className="topbar-right">
            <span className="save-state">
              <span className={`status-dot ${saving ? "busy" : ""}`} />
              {saving
                ? "Saving progress"
                : savedAt
                  ? "Progress saved"
                  : loaded
                    ? "Ready to track"
                    : "Loading save"}
            </span>
            <button
              className="icon-button"
              onClick={reset}
              aria-label="Reset progress"
              title="Reset progress"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> LOS SANTOS • SAN FIERRO • LAS VENTURAS
            </div>
            <h1>
              100%
              <br />
              <span>Completion.</span>
            </h1>
            <p>
              Every mission. Every collectible. Every last checkbox. Your road
              to total San Andreas domination starts here.
            </p>
            <a
              className="source-link"
              href="https://www.gta-sanandreas.com/guides/100percent/"
              target="_blank"
              rel="noreferrer"
            >
              Checklist based on GTA-SanAndreas.com <span>↗</span>
            </a>
          </div>
          <div className="progress-card">
            <div className="progress-card-top">
              <span>YOUR COMPLETION</span>
              <Trophy size={18} />
            </div>
            <div className="percent">
              <span>{percentage.toFixed(2)}</span>
              <small>%</small>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="progress-meta">
              <b>
                {completedObjectives} <span>/ {TOTAL_OBJECTIVES}</span>
              </b>
              <span>objectives complete</span>
            </div>
            <div className="progress-foot">
              <span>
                <Check size={13} /> Auto-saved to JSON
              </span>
              <span>{Math.round(percentage)}% done</span>
            </div>
          </div>
        </section>

        <section className="stats-row">
          <div className="stat">
            <span className="stat-label">OBJECTIVES COMPLETE</span>
            <strong>
              {completedObjectives}
              <small> / {TOTAL_OBJECTIVES}</small>
            </strong>
            <span className="stat-note">In-game completion credit</span>
          </div>
          <div className="stat">
            <span className="stat-label">CHECKBOXES TRACKED</span>
            <strong>
              {completedTasks}
              <small> / {totalTasks}</small>
            </strong>
            <span className="stat-note">Including individual collectibles</span>
          </div>
          <div className="stat">
            <span className="stat-label">REMAINING</span>
            <strong>{TOTAL_OBJECTIVES - completedObjectives}</strong>
            <span className="stat-note">Objectives until 100%</span>
          </div>
        </section>

        <section className="checklist-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow dark">THE COMPLETE CHECKLIST</div>
              <h2>Keep track of every detail.</h2>
            </div>
            <div className="tools">
              <label className="search-box">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search objectives..."
                />
              </label>
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                aria-label="Filter category"
              >
                <option value="all">All categories</option>
                {checklist.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-banner">{error}</div>}
          {!loaded && (
            <div className="loading">
              <LoaderCircle className="spin" size={20} /> Loading your saved
              checklist…
            </div>
          )}
          <div className="category-list">
            {visibleCategories.map((category) => {
              const isExpanded = expanded[category.id] ?? true;
              const done = categoryCompleteCount(category, checked);
              const categoryCount = category.items.length;
              return (
                <article className="category-card" key={category.id}>
                  <button
                    className="category-header"
                    onClick={() =>
                      setExpanded((current) => ({
                        ...current,
                        [category.id]: !isExpanded,
                      }))
                    }
                    aria-expanded={isExpanded}
                  >
                    <span className="category-number">
                      {String(checklist.indexOf(category) + 1).padStart(2, "0")}
                    </span>
                    <span className="category-title-wrap">
                      <strong>{category.title}</strong>
                      <small>
                        {category.description ??
                          `${categoryCount} completion objectives`}
                      </small>
                    </span>
                    <span className="category-progress">
                      <b>
                        {done}/{categoryCount}
                      </b>
                      <span className="mini-track">
                        <span
                          style={{
                            width: `${categoryCount ? (done / categoryCount) * 100 : 0}%`,
                          }}
                        />
                      </span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="category-body">
                      <div className="category-actions">
                        <span>
                          {
                            category.items.filter((item) =>
                              itemComplete(item, checked),
                            ).length
                          }{" "}
                          of {categoryCount} objectives done
                        </span>
                        <div>
                          <button onClick={() => setCategory(category, true)}>
                            Check all
                          </button>
                          <button onClick={() => setCategory(category, false)}>
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="item-list">
                        {category.items.map((item) => (
                          <ChecklistRow
                            key={item.id}
                            item={item}
                            checked={checked}
                            onChange={updateItem}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          <div className="footer-note">
            <CircleHelp size={17} />
            <p>
              <b>How completion is counted:</b> each of the 187 required
              objectives contributes approximately 0.534759358%. Child
              checkboxes help track progress within grouped activities and do
              not add completion credit by themselves.
            </p>
          </div>
        </section>
        <footer className="site-footer">
          <span>GTA: SAN ANDREAS 100% CHECKLIST</span>
          <span>
            {saving
              ? "Saving…"
              : savedAt
                ? `Last saved ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Local server JSON storage"}
          </span>
        </footer>
      </main>

      {authStatus !== "unlocked" && (
        <div className="auth-overlay">
          <section
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
          >
            <div className="auth-icon">
              <LockKeyhole size={25} />
            </div>

            {authStatus === "checking" ? (
              <>
                <h2 id="auth-title">Checking access</h2>
                <p>Verifying your session...</p>
                <LoaderCircle className="spin" size={22} />
              </>
            ) : (
              <>
                <span className="auth-eyebrow">SAN ANDREAS 100%</span>
                <h2 id="auth-title">Welcome back.</h2>
                <p>Enter your credentials to unlock your checklist.</p>

                <form onSubmit={handleLogin} className="auth-form">
                  <label>
                    Username
                    <input
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Enter username"
                      required
                      autoFocus
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </label>

                  {authError && (
                    <div className="error-banner" role="alert">
                      {authError}
                    </div>
                  )}

                  <button
                    className="auth-submit"
                    type="submit"
                    disabled={authSubmitting}
                  >
                    {authSubmitting ? (
                      <>
                        <LoaderCircle className="spin" size={17} />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Unlock checklist
                        <LockKeyhole size={16} />
                      </>
                    )}
                  </button>
                </form>

                <span className="auth-footnote">
                  Your progress is waiting for you.
                </span>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function ChecklistRow({
  item,
  checked,
  onChange,
  depth = 0,
}: {
  item: ChecklistItem;
  checked: CheckedState;
  onChange: (item: ChecklistItem, value: boolean) => void;
  depth?: number;
}) {
  const isChecked = itemComplete(item, checked);
  const childCount = item.children?.length ?? 0;
  const childDone =
    item.children?.filter((child) => itemComplete(child, checked)).length ?? 0;
  return (
    <div className={`check-item ${depth ? "child-item" : ""}`}>
      <label className={`check-label ${isChecked ? "is-checked" : ""}`}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(event) => onChange(item, event.target.checked)}
        />
        <span className="custom-check">
          <Check size={13} />
        </span>
        <span className="item-name">{item.title}</span>
        {item.credit === false && <span className="no-credit">TRACKING</span>}
        {item.credit !== false && (
          <span className="credit-dot" title="Awards completion credit" />
        )}
      </label>
      {childCount > 0 && (
        <div className="child-progress">
          {childDone}/{childCount}
        </div>
      )}
      {item.children && (
        <div className="children-list">
          {item.children.map((child) => (
            <ChecklistRow
              key={child.id}
              item={child}
              checked={checked}
              onChange={onChange}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
