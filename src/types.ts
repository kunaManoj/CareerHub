export type RemotePolicy = "Remote" | "Hybrid" | "On-site";
export type JobType = "Full-time" | "Contract" | "Part-time" | "Internship";
export type JobLevel = "Junior" | "Mid-level" | "Senior" | "Lead";
export type Category =
  | "Engineering"
  | "Design"
  | "Product"
  | "Data"
  | "Marketing"
  | "Sales"
  | "Operations"
  | "Finance";

export interface Company {
  id: string;
  name: string;
  sector: string;
  location: string;
  size: string;
  founded: number;
  about: string;
  brand: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  location: string;
  remote: RemotePolicy;
  type: JobType;
  level: JobLevel;
  category: Category;
  salaryMin: number;
  salaryMax: number;
  tags: string[];
  postedAt: number;
  featured?: boolean;
  applicants: number;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  careersUrl?: string;
}

export type AppStatus =
  | "submitted"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "offered"
  | "rejected"
  | "withdrawn";

export interface TimelineEntry {
  status: AppStatus;
  at: number;
  note?: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  email: string;
  coverNote: string;
  portfolio?: string;
  expectedSalary?: number;
  status: AppStatus;
  appliedAt: number;
  timeline: TimelineEntry[];
}

export type SortKey = "newest" | "salary-high" | "salary-low";

export interface Filters {
  query: string;
  location: string;
  categories: Category[];
  types: JobType[];
  levels: JobLevel[];
  remoteOnly: boolean;
  minSalary: number;
  sort: SortKey;
}

export type View = "board" | "dashboard" | "post";

export interface Toast {
  id: number;
  kind: "success" | "info" | "update";
  message: string;
}

export interface ApplyPayload {
  jobId: string;
  candidateName: string;
  email: string;
  coverNote: string;
  portfolio?: string;
  expectedSalary?: number;
}

export interface PostJobPayload {
  title: string;
  companyName: string;
  sector: string;
  location: string;
  remote: RemotePolicy;
  type: JobType;
  level: JobLevel;
  category: Category;
  salaryMin: number;
  salaryMax: number;
  tags: string[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  careersUrl?: string;
}
