import Investigator, { InvestigatorMSGraph } from '@utils/types/investigator.tsx';
import { investigatorFromUser } from '@/models/proposals/team';
import { type ApiResult, callApi, UNKNOWN_API_ERROR } from './apiResult';
import { api } from './client';

/** Finds the user with the given email in the directory, as an investigator to invite. */
export const findUserByEmail = (email: string): Promise<ApiResult<Investigator>> =>
  callApi(
    () => api.proposals.getUserByEmailOsoApiV17PhtPrslsMemberEmailGet(email),
    (data) => {
      // The generated client types the user as any object
      if (typeof data !== 'object') {
        throw new Error(UNKNOWN_API_ERROR);
      }
      return investigatorFromUser(data as InvestigatorMSGraph);
    }
  );

/** Emails an invitation to join the given proposal. */
export const sendInvite = (email: string, prslId: string): Promise<ApiResult<unknown>> =>
  callApi(() => api.proposals.sendEmailOsoApiV17PhtPrslsSendEmailPost({ email, prsl_id: prslId }));
