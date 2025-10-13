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
  reviewType: string;
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
