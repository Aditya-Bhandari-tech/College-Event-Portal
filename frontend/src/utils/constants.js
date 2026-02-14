export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
};

export const BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'Electronics and Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
];

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