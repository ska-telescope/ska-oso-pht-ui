import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ProposalType } from '@/models/proposals/proposal';
import { patchSensCalcResults } from '@/models/proposals/targetObservationOperations';
import { storageObject } from '@utils/storage/store';
import { STATUS_PARTIAL } from '@/utils/constants';
import { useNotify } from '@/utils/notify/useNotify';
import type Proposal from '@/utils/types/proposal';
import type TargetObservation from '@/utils/types/targetObservation';
import { getTargetObservationKey } from '@/utils/update/sensCalc/updateSensCalc';
import { SENS_CALC_ERROR_KIND } from './client';
import { buildSensitivityRequest, sendSensitivityRequest } from './calculate';
import { toSensCalcResults } from './results';

export const SENS_CALC_DEBOUNCE_MS = 500;

/**
 * A record for each link, by link ID: the sensitivity calculator request its current results
 * were calculated from, and the request's controller while it is still in flight.
 */
type LinkRecords = Map<string, { requestKey: string; controller?: AbortController }>;

// A link with no results, or with results still to be calculated (a new or cloned link)
const needsResults = (link: TargetObservation) =>
  !link.sensitivityResults || link.sensitivityResults.statusGUI === STATUS_PARTIAL;

/**
 * Keeps the sensitivity results of every target–observation link up to date. Runs for the whole
 * proposal editor, so a calculation finishes even if the user leaves the page that started it.
 *
 * Each link is recalculated when the request its inputs give changes, after a short debounce. A
 * superseded request is canceled, and a result is only applied while its request is still the
 * link's current one. Results stored with a proposal are taken as current when it is opened. A
 * calculator error is shown as a notification, as well as stored on the link.
 */
export const useSensitivityService = () => {
  const { control, getValues, setValue } = useFormContext<ProposalType>();
  // TODO BTN-3595 Read observations and data products from the form once they are migrated to it
  const { application } = storageObject.useStore();
  const proposal = application.content2 as Proposal | undefined;
  const observations = proposal?.observations;
  const dataProducts = proposal?.dataProductSDP;
  const { notifyError } = useNotify();
  const [targets, links] = useWatch({ control, name: ['targets', 'targetObservation'] });

  const recordsRef = React.useRef<LinkRecords>(new Map());

  // A different proposal starts again: its stored results are taken as current
  React.useEffect(() => {
    recordsRef.current.forEach((record) => record.controller?.abort());
    recordsRef.current.clear();
  }, [proposal?.id]);

  React.useEffect(() => {
    const update = () => {
      const form = { getValues, setValue };
      const formLinks = (links ?? []) as TargetObservation[];
      const formTargets = targets ?? [];

      // Forget links that no longer exist, canceling their requests
      const linkIds = new Set(formLinks.map(getTargetObservationKey));
      recordsRef.current.forEach((record, linkId) => {
        if (!linkIds.has(linkId)) {
          record.controller?.abort();
          recordsRef.current.delete(linkId);
        }
      });

      formLinks.forEach((link) => {
        // TODO BTN-3595 link.id once links have their own ID; until then, the three IDs joined
        const linkId = getTargetObservationKey(link);
        const target = formTargets.find((t) => t.id === link.targetId);
        const observation = observations?.find((o) => o.id === link.observationId);
        const dataProduct = dataProducts?.find((d) => d.id === link.dataProductsSDPId);
        if (!target || !observation || !dataProduct) {
          return;
        }

        // TODO BTN-3595 Once observations and data products are in the form, check them against
        //  their item schemas before building the request: the same rules that decide what is
        //  saved. SV proposals edit their one observation and data product in place, so the form
        //  can hold values that aren't valid yet, which the calculator would reject. Until then,
        //  half-edited values are sent and come back as calculator errors. Something like:
        //
        //    const inputsValid =
        //      getObservationSchema().safeParse(observation).success &&
        //      getDataProductSchema().safeParse(dataProduct).success;
        //    const request = inputsValid
        //      ? buildSensitivityRequest(observation, target, dataProduct)
        //      : null;
        //    // One key for all invalid inputs: further invalid edits change nothing, and a valid
        //    // edit recalculates
        //    const requestKey = !inputsValid
        //      ? 'invalid'
        //      : request ? request.path + JSON.stringify(request.body) : '';
        //
        //  and after the superseded request is canceled below, an invalid link is not calculated:
        //
        //    if (!inputsValid) {
        //      recordsRef.current.set(linkId, { requestKey });
        //      if (link.sensitivityResults?.statusGUI === STATUS_INITIAL) return;
        //      patchSensCalcResults(form, [
        //        { targetObservationKey: linkId, sensitivityResults: { statusGUI: STATUS_INITIAL } }
        //      ]);
        //      return;
        //    }
        const request = buildSensitivityRequest(observation, target, dataProduct);
        const requestKey = request ? request.path + JSON.stringify(request.body) : '';

        const record = recordsRef.current.get(linkId);
        if (record ? record.requestKey === requestKey : !needsResults(link)) {
          // Unchanged, or seen for the first time with results that are taken as current
          if (!record) recordsRef.current.set(linkId, { requestKey });
          return;
        }

        record?.controller?.abort();

        if (!request) {
          // The calculator doesn't apply (SSO targets and PST), so the link has no results
          recordsRef.current.set(linkId, { requestKey });
          if (!link.sensitivityResults) return;
          patchSensCalcResults(form, [
            {
              targetObservationKey: linkId,
              sensitivityResults: toSensCalcResults(null, observation)
            }
          ]);
          return;
        }

        // Shown as calculating until the response arrives, rather than with the previous results
        if (link.sensitivityResults?.statusGUI !== STATUS_PARTIAL) {
          patchSensCalcResults(form, [
            {
              targetObservationKey: linkId,
              sensitivityResults: { statusGUI: STATUS_PARTIAL, error: '' }
            }
          ]);
        }

        const controller = new AbortController();
        recordsRef.current.set(linkId, { requestKey, controller });
        void sendSensitivityRequest(request, { signal: controller.signal }).then((response) => {
          const isCurrent = recordsRef.current.get(linkId)?.requestKey === requestKey;
          if (!isCurrent || (!response.ok && response.kind === SENS_CALC_ERROR_KIND.ABORTED)) {
            // Ignore stale and aborted responses
            return;
          }
          recordsRef.current.set(linkId, { requestKey });
          const results = toSensCalcResults(response, observation);
          patchSensCalcResults(form, [
            { targetObservationKey: linkId, sensitivityResults: results }
          ]);
          if (!response.ok) {
            notifyError(results?.error ?? '');
          }
        });
      });
    };

    const timer = setTimeout(update, SENS_CALC_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // notifyError is a new function on every render, and the service re-renders on any store
    // change. Any copy of it works, so it isn't a dependency: one would restart the debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, links, observations, dataProducts, getValues, setValue]);
};

/**
 * Runs useSensitivityService. Render it once, inside the proposal FormProvider and
 * outside the routes, so it stays mounted for the whole proposal editor.
 */
export const SensitivityService = () => {
  useSensitivityService();
  return null;
};
