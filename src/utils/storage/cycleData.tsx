import CycleData from 'utils/types/cycleData';

export const storeCycleData = (response: CycleData[]) => {
  sessionStorage.setItem('skao_cycle_data', JSON.stringify(response));
};

export const fetchCycleData = () => {
  const data = JSON.parse(sessionStorage.getItem('skao_cycle_data'));
  return data[0];
};
