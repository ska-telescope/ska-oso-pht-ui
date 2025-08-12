type TeamMember = {
  id: string;
  userId?: string; // Entra ID // TODO make this mandatory
  firstName: string;
  lastName: string;
  email: string;
  affiliation: string;
  phdThesis: boolean;
  status: string;
  pi: boolean;
};

export default TeamMember;

export type EntraUser = {
  userId: string; // Entra ID
  firstName: string;
  lastName: string;
  email: string; // This should always be a SKAO email (@community.skao.int or @skao.int) // userPrincipalName in MS Graph 
};
