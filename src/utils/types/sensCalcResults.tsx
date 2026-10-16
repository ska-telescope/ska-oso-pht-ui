import { STATUS } from '@utils/constants.ts';

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
