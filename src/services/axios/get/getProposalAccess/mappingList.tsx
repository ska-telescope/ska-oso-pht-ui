import ProposalAccess, { ProposalAccessBackend } from '@/utils/types/proposalAccess';

export function mappingList(inRec: ProposalAccessBackend[]): ProposalAccess[] {
  const output = [];
  for (let i = 0; i < inRec.length; i++) {
    const rec: ProposalAccess = {
      id: inRec[i].access_id,
      prslId: inRec[i].prsl_id?.toString(),
      userId: inRec[i].user_id,
      role: inRec[i].role,
      permissions: inRec[i].permissions
    };
    output.push(rec);
  }
  return output as ProposalAccess[];
}
