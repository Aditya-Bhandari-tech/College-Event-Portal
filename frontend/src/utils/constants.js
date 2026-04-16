export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
};

// ─── Single Source of Truth for Branches ─────────────────────────────────────
// All branch data lives here. Every file must import from this module.

/** Raw branch data sorted alphabetically by label */
const RAW_BRANCHES = [
  { value: 'AE', label: 'Automobile Engineering' },
  { value: 'CE', label: 'Civil Engineering' },
  { value: 'CSE', label: 'Computer Science Engineering' },
  { value: 'EE', label: 'Electrical Engineering' },
  { value: 'ENTC', label: 'Electronics & Telecommunication Engineering' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'ME', label: 'Mechanical Engineering' },
].sort((a, b) => a.label.localeCompare(b.label));

/** Same list but without the "All Branches" entry — for signup / profile forms */
export const BRANCH_OPTIONS_NO_ALL = [...RAW_BRANCHES];

/** Dropdown options with value/label pairs — includes "All Branches" */
export const BRANCHES = [
  { value: 'ALL', label: 'All Branches' },
  ...BRANCH_OPTIONS_NO_ALL,
];

/** Flat array of full branch names — for legacy forms that use plain strings */
export const BRANCH_NAMES = BRANCH_OPTIONS_NO_ALL.map(b => b.label);

/** Map from code → full label  (e.g. 'CSE' → 'Computer Science Engineering') */
export const BRANCH_LABELS = Object.fromEntries(
  BRANCHES.map(b => [b.value, b.label]),
);

/** Resolve any branch key (code, full name, or mixed) to its display label */
export const getBranchLabel = (val) => {
  if (!val) return 'All Branches';
  const upper = val.toUpperCase?.() ?? val;
  // Direct code match
  if (BRANCH_LABELS[upper]) return BRANCH_LABELS[upper];
  // Already a full name?
  const found = BRANCHES.find(
    b => b.label.toLowerCase() === val.toLowerCase(),
  );
  return found ? found.label : val;
};

// ─── Other Constants ─────────────────────────────────────────────────────────

export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const RECRUITMENT_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
};

export const APPLICANT_STATUS = {
  PENDING: 'pending',
  SELECTED: 'selected',
  REJECTED: 'rejected',
};