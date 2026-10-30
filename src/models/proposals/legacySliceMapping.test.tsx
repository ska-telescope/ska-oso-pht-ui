import { describe, expect, test } from 'vitest';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import MappingPutProposal from '@services/axios/put/putProposal/putProposalMapping';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { PROPOSAL_STATUS } from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockSlicesPdm } from './mockSlicesPdm';
import { mapPdmToForm } from './pdmMapper';
import { targetsToPdm } from './targets';
import { observationTypesFromPdm, targetObservationToPdm } from './targetObservation';
import { calibrationStrategyToPdm } from './calibrationStrategy';
import golden from './legacySliceMapping.golden.json';

// The golden file holds what the legacy mappers produced for these PDMs before their target, link
// and calibration code moved into the slice mappers (generated from origin/main at 8f2605859).
// The legacy mappers now delegate to the slice mappers, so comparing the two directly would only
// compare the code with itself.
const pdms = {
  MockSlicesPdm,
  MockProposalBackend: MockProposalBackend as unknown as ProposalBackend,
  MockProposalBackendZoom: MockProposalBackendZoom as unknown as ProposalBackend
};

describe.each(Object.entries(pdms))(
  'slice mapping parity with the legacy mappers: %s',
  (name, pdm) => {
    const expected = golden[name as keyof typeof golden];
    const form = mapPdmToForm(pdm);
    const observationTypes = observationTypesFromPdm(pdm.observation_info?.observation_sets);

    test('loads the same targets, links and calibration', () => {
      expect(form.targets).toEqual(expected.form.targets);
      expect(form.targetObservation).toEqual(expected.form.targetObservation);
      expect(form.calibrationStrategy).toEqual(expected.form.calibrationStrategy);
    });

    test('saves the same targets', () => {
      expect(targetsToPdm(form.targets ?? [])).toEqual(expected.pdm.targets);
    });

    test('saves the same results', () => {
      expect(targetObservationToPdm(form.targetObservation ?? [], observationTypes)).toEqual(
        expected.pdm.result_details
      );
    });

    test('saves the same calibration', () => {
      expect(calibrationStrategyToPdm(form.calibrationStrategy ?? [])).toEqual(
        expected.pdm.calibration_strategy
      );
    });

    test('saves the same slices through the legacy proposal mapper', () => {
      const saved = MappingPutProposal(mapping(pdm), PROPOSAL_STATUS.DRAFT).observation_info;
      expect({
        targets: saved.targets,
        result_details: saved.result_details,
        calibration_strategy: saved.calibration_strategy
      }).toEqual(expected.pdm);
    });
  }
);
