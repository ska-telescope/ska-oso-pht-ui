import { describe, expect, expectTypeOf, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockSlicesPdm } from './testing/mockSlicesPdm';
import Target from '@utils/types/target';
import { VELOCITY_DEFINITION, VELOCITY_TYPE } from '@/utils/constants';
import { getTargetsSchema, TargetsType, targetsFromPdm, targetsToPdm } from './targets';

const mockPdms = [
  ['MockSlicesPdm', MockSlicesPdm],
  ['MockProposalBackend', MockProposalBackend as unknown as ProposalBackend],
  ['MockProposalBackendZoom', MockProposalBackendZoom as unknown as ProposalBackend]
] as const;

describe('targets schema', () => {
  const schema = getTargetsSchema();

  test.each(mockPdms)('accepts the targets the legacy mapper loads from %s', (_, pdm) => {
    const { targets } = mapping(pdm);
    expect(targets).not.toHaveLength(0);
    expect(schema.safeParse(targets).error).toBeUndefined();
  });

  test('accepts a proposal with no targets', () => {
    expect(schema.safeParse([]).success).toBe(true);
  });

  test('rejects a target without an id', () => {
    expect(schema.safeParse([{ name: 'M2', kind: 0 }]).success).toBe(false);
  });

  test('legacy targets can seed the form', () => {
    expectTypeOf<Target[]>().toExtend<TargetsType>();
  });
});

describe('targets PDM mapping', () => {
  test.each(mockPdms)('round-trips %s through the form without further change', (_, pdm) => {
    const saved = targetsToPdm(targetsFromPdm(pdm.observation_info?.targets));
    expect(targetsToPdm(targetsFromPdm(saved))).toEqual(saved);
  });

  // Proper motion, parallax and epoch are not used by the PHT, so they are not sent; the PDM
  // fills in its defaults
  const UNUSED_FIELDS = ['pm_ra', 'pm_dec', 'pm_l', 'pm_b', 'parallax', 'epoch'];

  // Saving gives back every field that was loaded except the pointing pattern, which is not kept,
  // and the unused coordinate fields above
  const savedFrom = (pdm: ProposalBackend) =>
    structuredClone(pdm.observation_info.targets ?? []).map(
      ({ pointing_pattern: _, ...target }) => ({
        ...target,
        reference_coordinate: Object.fromEntries(
          Object.entries(target.reference_coordinate ?? {}).filter(
            ([field]) => !UNUSED_FIELDS.includes(field)
          )
        ) as typeof target.reference_coordinate
      })
    );

  test.each(mockPdms)('saves the targets of %s', (_, pdm) => {
    expect(targetsToPdm(targetsFromPdm(pdm.observation_info.targets))).toEqual(savedFrom(pdm));
  });

  test('loads a target with a redshift as a redshift, and any other as a velocity', () => {
    const [velocity, redshift] = targetsFromPdm(MockSlicesPdm.observation_info.targets);
    expect(velocity.velType).toBe(VELOCITY_TYPE.VELOCITY);
    expect(redshift.velType).toBe(VELOCITY_TYPE.REDSHIFT);
  });

  test('loads a target without a velocity definition with the PDM default', () => {
    const [pdmTarget] = MockSlicesPdm.observation_info.targets ?? [];
    const { definition: _, ...noDefinition } = pdmTarget.radial_velocity ?? {};
    const [target] = targetsFromPdm([{ ...pdmTarget, radial_velocity: noDefinition }]);
    expect(target.velocityDefinition).toBe(VELOCITY_DEFINITION.RADIO);
  });

  test('loads a target without a reference frame with the PDM default', () => {
    const [pdmTarget] = MockSlicesPdm.observation_info.targets ?? [];
    const { reference_frame: _, ...noFrame } = pdmTarget.radial_velocity ?? {};
    const [target] = targetsFromPdm([{ ...pdmTarget, radial_velocity: noFrame }]);
    expect(target.referenceFrame).toBe('LSRK');
  });

  test('leaves the reference frame to the PDM for a target entered without one', () => {
    const [target] = targetsFromPdm(MockSlicesPdm.observation_info.targets);
    const [saved] = targetsToPdm([{ ...target, referenceFrame: undefined }]);
    expect(saved.radial_velocity?.reference_frame).toBeUndefined();
  });

  test('reads missing targets as an empty list', () => {
    expect(targetsFromPdm(undefined)).toEqual([]);
  });
});
