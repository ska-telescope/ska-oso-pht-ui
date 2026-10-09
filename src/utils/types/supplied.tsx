import type { Supplied as SuppliedPDM } from '@/generated/models/supplied';

type Supplied = {
  type: number;
  value: number;
  units: number;
};

export type SuppliedBackend = SuppliedPDM;

export default Supplied;
