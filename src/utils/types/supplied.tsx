import { ValueUnitPair } from './valueUnitPair';

type Supplied = {
  type: number;
  value: number;
  units: number;
};

export type SuppliedBackend = {
  supplied_type: string;
  quantity: ValueUnitPair;
};

export default Supplied;
