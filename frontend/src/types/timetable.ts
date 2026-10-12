export type Role = 'principal' | 'hod' | 'staff' | 'student';

export interface User {
  id: string;
  name: string;
  role: Role;
  roleLabel: string;
  email: string;
  avatar: string;
  department: string;
  deptCode: string;
  username?: string;
  phone?: string;
  degree?: string;
  collegeId?: string;
  dob?: string;
  address?: string;
  designation?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  icon: string;
  hod: string;
  isPrimary?: boolean;
}

export interface ClassSection {
  id: string;
  name: string;
  deptCode: string;
  yearLevel: number;
  room: string;
}

export interface Teacher {
  id: string;
  name: string;
  deptCode: string;
  department: string;
  designation: string;
  avatar: string;
  weeklyHours: number;
  maxHours: number;
  phone?: string;
  email?: string;
  degree?: string;
  collegeId?: string;
}

export interface Period {
  id: number;
  name: string;
  time: string;
  type: 'lecture' | 'break';
}

export interface TimetableSlot {
  subject: string;
  subjectCode: string;
  teacher: string;
  teacherId?: string;
  room: string;
  isLab?: boolean;
  isSubstitute?: boolean;
  color?: string;
}

export type ClassTimetable = Record<string, Record<number, TimetableSlot | null>>;
export type CollegeTimetable = Record<string, ClassTimetable>;

export interface SolverMetrics {
  clashes: number;
  fitnessScore: number;
  timeTakenMs: number;
  solver: string;
  status: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  semester: string | number;
  year: string | number;
  deptCode?: string;
  ownerDeptCode?: string;
  department?: string;
  teacher?: string;
  credits?: number;
  hoursPerWeek?: number;
  isLab?: boolean;
  section?: string;
}

export interface GeneratorConfig {
  startTime: string;
  endTime: string;
  totalHours: number;
  breakStartTime: string;
  breakEndTime: string;
  lunchStartTime: string;
  lunchEndTime: string;
  absentFacultyNames?: string[];
}
