import type { TargetInput } from '@/models/proposals/targets';

export const mockTarget: TargetInput = {
  id: 'target-1',
  name: 'm2',
  referenceCoordinate: { kind: 'icrs', raStr: '21:33:27.0200', decStr: '-00:49:23.700' },
  radialMotion: { type: 'velocity', velocity: { value: -3.6, unit: 'km / s' } },
  velocityDefinition: 'RADIO',
  referenceFrame: 'LSRK',
  fieldPatternType: 'PointedMosaicParameters'
};
