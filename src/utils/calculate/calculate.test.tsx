import { describe, it, expect } from 'vitest';
import { calculateCentralFrequency, calculateContinuumBandwidth } from '../calculate/calculate';
import { BAND_1, BAND_2, BAND_5A, BAND_5B } from '../constants';

describe('calculate Functions', () => {
  const mockOSD = {
    CentralFrequencyOB1: [{ lookup: 1, value: 100 }],
    CentralFrequencyOB2: [{ lookup: 2, value: 200 }],
    CentralFrequencyOB5a: [{ value: 300 }],
    CentralFrequencyOB5b: [{ value: 400 }],
    CentralFrequencyOBLow: [{ value: 500 }]
  };

  it('Calculate Central Frequency: should return the correct value for BAND_1', () => {
    const result = calculateCentralFrequency(BAND_1, 1, mockOSD);
    expect(result).toBe(100);
  });

  it('Calculate Central Frequency: should return the correct value for BAND_2', () => {
    const result = calculateCentralFrequency(BAND_2, 2, mockOSD);
    expect(result).toBe(200);
  });

  it('Calculate Central Frequency: should return the correct value for BAND_5A', () => {
    const result = calculateCentralFrequency(BAND_5A, 0, mockOSD);
    expect(result).toBe(300);
  });

  it('Calculate Central Frequency: should return the correct value for BAND_5B', () => {
    const result = calculateCentralFrequency(BAND_5B, 0, mockOSD);
    expect(result).toBe(400);
  });

  it('Calculate Central Frequency: should return the correct value for default case (LOW)', () => {
    const result = calculateCentralFrequency(999, 0, mockOSD);
    expect(result).toBe(500);
  });

  it('Calculate Continuum Bandwidth: should return the correct value for BAND_1', () => {
    const result = calculateContinuumBandwidth(BAND_1, 1, mockOSD);
    expect(result).toBe(100);
  });

  it('Calculate Continuum Bandwidth: should return the correct value for BAND_2', () => {
    const result = calculateContinuumBandwidth(BAND_2, 2, mockOSD);
    expect(result).toBe(200);
  });

  it('Calculate Continuum Bandwidth: should return the correct value for BAND_5A', () => {
    const result = calculateContinuumBandwidth(BAND_5A, 3, mockOSD);
    expect(result).toBe(300);
  });

  it('Calculate Continuum Bandwidth: should return the correct value for BAND_5B', () => {
    const result = calculateContinuumBandwidth(BAND_5B, 4, mockOSD);
    expect(result).toBe(400);
  });

  it('Calculate Continuum Bandwidth: should return the correct value for default case (LOW)', () => {
    const result = calculateContinuumBandwidth(999, 5, mockOSD);
    expect(result).toBe(500);
  });
});
