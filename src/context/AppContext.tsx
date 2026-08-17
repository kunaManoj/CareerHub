import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import type {
  Application, AppStatus, ApplyPayload, Category, Company, Filters, Job, JobLevel, JobType,
  PostJobPayload, SortKey, Toast, View,
} from "../types";
import * as api from "../services/api";

export const DEFAULT_FILTERS: Filters = {
  query: "",
  location: "",
  categories: [],
  types: [],
  levels: [],
  remoteOnly: false,
  minSalary: 0,
  sort: "newest",
};

export const STATUS_META: Record<AppStatus, { label: string; chip: string; dot: string }> = {
  submitted: { label: "Submitted", chip: "bg-mist text-ink-700", dot: "bg-ink-400" },
  reviewing: { label: "Under review", chip: "bg-honey-100 text-honey-700", dot: "bg-honey-500" },
  shortlisted: { label: "Shortlisted", chip: "bg-sky2-100 text-sky2-600", dot: "bg-sky2-600" },
  interview: { label: "Interview", chip: "bg-pine-100 text-pine-700", dot: "bg-pine-500" },
  offered: { label: "Offer", chip: "bg-pine-600 text-paper", dot: "bg-pine-400" },
  rejected: { label: "Not selected", chip: "bg-coral-100 text-coral-500", dot: "bg-coral-500" },
  withdrawn: { label: "Withdrawn", chip: "bg-mist text-ink-400", dot: "bg-ink-300" },
};

interface AppContextValue {
  companies: Company[];
  companyById: Map<string, Company>;
  jobs: Job[];
  results: Job[];
  applications: Application[];
  savedIds: string[];
  recentIds: string[];
  filters: Filters;
  activeFilterCount: number;
  view: View;
  dashboardTab: "applications" | "saved";
  setDashboardTab: (t: "applications" | "saved") => void;
  initialLoading: boolean;
  loadError: string | null;
  searching: boolean;
  selectedJobId: string | null;
  applyJobId: string | null;
  toasts: Toast[];
  setView: (v: View) => void;
  patchFilters: (patch: Partial<Filters>) => void;
  toggleFilterValue: (key: "categories" | "types" | "levels", value: Category | JobType | JobLevel) => void;
  resetFilters: () => void;
  openJob: (id: string) => void;
  closeJob: () => void;
  toggleSave: (id: string) => void;
  openApply: (id: string) => void;
  closeApply: () => void;
  submitApplication: (payload: ApplyPayload) => Promise<void>;
  withdrawApplication: (id: string) => Promise<void>;
  publishJob: (payload: PostJobPayload) => Promise<Job>;
  subscribeAlert: (email: string) => Promise<void>;
  pushToast: (kind: Toast["kind"], message: string) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setViewRaw] = useState<View>("board");
  const [dashboardTab, setDashboardTab] = useState<"applications" | "saved">("applications");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const jobsRef = useRef<Job[]>([]);
  jobsRef.current = jobs;
  const searchTimer = useRef<number | undefined>(undefined);

  const pushToast = useCallback((kind: Toast["kind"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ---- initial load ---- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cos, js, apps] = await Promise.all([
          api.fetchCompanies(),
          api.fetchJobs(),
          api.fetchApplications(),
        ]);
        if (!mounted) return;
        setCompanies(cos);
        setJobs(js);
        setApplications(api.progressApplications(apps).next);
        setSavedIds(api.fetchSavedIds());
        setRecentIds(api.fetchRecentIds());
      } catch (error) {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load the CareerHub backend.");
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---- hiring simulation tick ---- */
  useEffect(() => {
    const tick = () => {
      setApplications((prev) => {
        const { next, changed } = api.progressApplications(prev);
        if (changed.length) {
          changed.forEach((a) => {
            const job = jobsRef.current.find((j) => j.id === a.jobId);
            pushToast("update", `${job?.title ?? "Your application"} moved to ${STATUS_META[a.status].label}`);
          });
          api.persistProgress(changed);
          return next;
        }
        return prev;
      });
    };
    const t = window.setInterval(tick, 5000);
    return () => window.clearInterval(t);
  }, [pushToast]);

  /* ---- filtered results with a brief "searching" shimmer ---- */
  const companyById = useMemo(() => api.companyMap(companies), [companies]);
  const results = useMemo(() => api.applyFilters(jobs, companyById, filters), [jobs, companyById, filters]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSearching(true);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => setSearching(false), 320);
    return () => window.clearTimeout(searchTimer.current);
  }, [filters]);

  const activeFilterCount =
    filters.categories.length + filters.types.length + filters.levels.length +
    (filters.remoteOnly ? 1 : 0) + (filters.minSalary > 0 ? 1 : 0) +
    (filters.location ? 1 : 0);

  /* ---- actions ---- */
  const setView = useCallback((v: View) => {
    setViewRaw(v);
    setSelectedJobId(null);
    setApplyJobId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const patchFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleFilterValue = useCallback(
    (key: "categories" | "types" | "levels", value: Category | JobType | JobLevel) => {
      setFilters((prev) => {
        const list = prev[key] as string[];
        const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const openJob = useCallback((id: string) => {
    setSelectedJobId(id);
    setRecentIds(api.pushRecentId(id));
  }, []);

  const closeJob = useCallback(() => setSelectedJobId(null), []);

  const toggleSave = useCallback(
    (id: string) => {
      setSavedIds((prev) => {
        const saving = !prev.includes(id);
        const next = saving ? [id, ...prev] : prev.filter((x) => x !== id);
        api.persistSavedIds(next);
        const job = jobsRef.current.find((j) => j.id === id);
        pushToast(saving ? "success" : "info", saving ? `Saved “${job?.title ?? "role"}” to your shortlist` : `Removed “${job?.title ?? "role"}” from shortlist`);
        return next;
      });
    },
    [pushToast],
  );

  const openApply = useCallback((id: string) => setApplyJobId(id), []);
  const closeApply = useCallback(() => setApplyJobId(null), []);

  const submitApplication = useCallback(
    async (payload: ApplyPayload) => {
      const app = await api.createApplication(payload);
      setApplications((prev) => [app, ...prev]);
      setJobs((prev) => prev.map((j) => (j.id === payload.jobId ? { ...j, applicants: j.applicants + 1 } : j)));
      const job = jobsRef.current.find((j) => j.id === payload.jobId);
      const co = job ? companyById.get(job.companyId) : undefined;
      pushToast("success", `Application sent to ${co?.name ?? "the hiring team"}`);
      setSelectedJobId(null);
      setViewRaw("dashboard");
      setDashboardTab("applications");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [companyById, pushToast],
  );

  const withdrawApplication = useCallback(
    async (id: string) => {
      const next = await api.withdrawApplication(id);
      setApplications(next);
      pushToast("info", "Application withdrawn.");
    },
    [pushToast],
  );

  const publishJob = useCallback(
    async (payload: PostJobPayload) => {
      const { job, company } = await api.postJob(payload);
      setCompanies((prev) => (prev.some((c) => c.id === company.id) ? prev : [...prev, company]));
      setJobs((prev) => [job, ...prev]);
      pushToast("success", `“${job.title}” is live on the board`);
      setViewRaw("board");
      setSelectedJobId(job.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return job;
    },
    [pushToast],
  );

  const subscribeAlert = useCallback(
    async (email: string) => {
      const parts: string[] = [];
      if (filters.query) parts.push(`“${filters.query}”`);
      if (filters.categories.length) parts.push(filters.categories.join("/"));
      if (filters.remoteOnly) parts.push("remote");
      await api.subscribeAlert(email, parts.join(" · ") || "All new roles");
      pushToast("success", `Alert armed — new matches go to ${email}`);
    },
    [filters, pushToast],
  );

  const value: AppContextValue = {
    companies, companyById, jobs, results, applications, savedIds, recentIds, filters,
    activeFilterCount, view, dashboardTab, setDashboardTab, initialLoading, loadError, searching,
    selectedJobId, applyJobId, toasts, setView, patchFilters, toggleFilterValue, resetFilters,
    openJob, closeJob, toggleSave, openApply, closeApply, submitApplication, withdrawApplication,
    publishJob, subscribeAlert, pushToast, dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
