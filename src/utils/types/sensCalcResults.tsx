import { STATUS } from '@utils/constants.ts';
import type { Result } from '@/generated/models/result';

export type ResultsDetailsBackend = Result;

export type SensCalcResults = {
  statusGUI: STATUS;
  error?: string;
  section1?: ResultsSection[];
  section2?: ResultsSection[];
  section3?: ResultsSection[];
};

export type ResultsSection = {
  field: string;
  value: string;
  units?: string;
};
