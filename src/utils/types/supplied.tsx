import { ValueUnitPair } from './valueUnitPair';

type Supplied = {
  type: number;
  value: number;
  units: number;
};

export type SuppliedBackend = {
  type: string;
  value: number;
  unit: string;
  quantity: ValueUnitPair;
};

export default Supplied;
