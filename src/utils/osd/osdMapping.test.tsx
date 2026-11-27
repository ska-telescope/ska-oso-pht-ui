import { describe, expect, test } from 'vitest';
import ObservatoryData from '@utils/types/observatoryData.tsx';
import { MockObservatoryDataFrontend } from '@/utils/osd/testing/mockObservatoryDataFrontend';
import {
  MockObservatoryDataBackend,
  MockObservatoryDataBackendProposal
} from '@/utils/osd/testing/mockObservatoryDataBackend';
import { osdMapping } from './osdMapping';
import { SA_AA2 } from '@/utils/constants';
import { ODT_CONFIGURATION_FALLBACK } from './odtConfigurationFallback';

// The mapped data holds functions, which aren't compared
const stripFunctions = (obj: unknown) =>
  JSON.parse(
    JSON.stringify(obj, (_key, value) => (typeof value === 'function' ? undefined : value))
  );

describe('osdMapping', () => {
  test('maps a cycle to its policy and capabilities', () => {
    const result = osdMapping([MockObservatoryDataBackend], ODT_CONFIGURATION_FALLBACK);
    const expectedPolicies = MockObservatoryDataFrontend.policies.filter(
      (policy) => policy.cycleNumber === MockObservatoryDataBackend.observatory_policy.cycle_number
    );
    const expectedResult = { ...MockObservatoryDataFrontend, policies: expectedPolicies };
    expect(stripFunctions(result)).to.deep.equal(stripFunctions(expectedResult));
  });

  test('maps multiple backend cycles to frontend policies', () => {
    const result = osdMapping(
      [MockObservatoryDataBackend, MockObservatoryDataBackendProposal],
      ODT_CONFIGURATION_FALLBACK
    ) as ObservatoryData;
    expect(stripFunctions(result)).to.deep.equal(stripFunctions(MockObservatoryDataFrontend));
  });

  test('reads LOW capabilities from whichever array_assembly key the cycle actually has (e.g. AA2_SV), not a hardcoded AA2', () => {
    const aa2SvCycle = {
      ...MockObservatoryDataBackend,
      observatory_policy: {
        ...MockObservatoryDataBackend.observatory_policy,
        telescope_capabilities: {
          Mid: SA_AA2,
          Low: 'AA2_SV'
        }
      },
      capabilities: {
        ...MockObservatoryDataBackend.capabilities,
        low: {
          basic_capabilities: MockObservatoryDataBackend.capabilities.low.basic_capabilities,
          AA2_SV: {
            ...MockObservatoryDataBackend.capabilities.low.AA2,
            number_zoom_channels: 4000
          }
        }
      }
    };

    const result = osdMapping([aa2SvCycle], ODT_CONFIGURATION_FALLBACK);
    const sArray = result.policies[0].capabilities.low?.subArrays.find(
      (s) => s.subArray === SA_AA2
    );
    expect(sArray?.numberZoomChannels).toBe(4000);
  });

  test('normalizes telescope_capabilities of "AA2_SV" to SA_AA2 in cyclePolicies.low/mid', () => {
    const aa2SvCycle = {
      ...MockObservatoryDataBackend,
      observatory_policy: {
        ...MockObservatoryDataBackend.observatory_policy,
        telescope_capabilities: {
          Mid: 'AA2_SV',
          Low: 'AA2_SV'
        }
      }
    };

    const result = osdMapping([aa2SvCycle], ODT_CONFIGURATION_FALLBACK);
    expect(result.policies[0].cyclePolicies.low).toEqual([SA_AA2]);
    expect(result.policies[0].cyclePolicies.mid).toEqual([SA_AA2]);
  });
});
