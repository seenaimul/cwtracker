
export interface Coursework {
  id: string;
  subject: string;
  title:string;
  dueDate: string; // ISO string
  location?: string;
  color: string; // Tailwind bg color class
}

export enum ViewMode {
  CLOCK,
  DATE,
}

export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface Alarm {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  label: string;
  enabled: boolean;
  repeat: DayOfWeek[];
}

export interface Grade {
    id: string;
    moduleName: string;
    marks: number;
}

export type Theme = 'light' | 'dark';

// --- Degree Calculator Types ---

export type DegreeType = 'undergraduate' | 'postgraduate';

export interface Module {
  id: string;
  name: string;
  credits: number;
  grade: number;
  level: number;
  isPredicted: boolean;
}

export interface UniversityRule {
  level: number;
  excludeCredits: number;
}

export interface UniversityPreset {
  name: string;
  rules: UniversityRule[];
  classificationBoundaries: {
    undergraduate: { [key: string]: number };
    postgraduate: { [key: string]: number };
  };
}
