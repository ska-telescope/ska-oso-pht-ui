export type Reviewer = {
  id: string;
  jobTitle: string;
  givenName: string;
  surname: string;
  displayName: string;
  mail: string;
  officeLocation: string;
  subExpertise: string;
  isScience: boolean;
  isTechnical: boolean;
};

export type ReviewerBackend = {
  id: string;
  jobTitle: string;
  givenName: string;
  surname: string;
  displayName: string;
  mail: string;
  officeLocation: string;
  subExpertise: string;
};
