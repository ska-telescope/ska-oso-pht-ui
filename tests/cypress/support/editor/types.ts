// Types for the proposal fixtures and the page objects that enter and check them.
//
// Values are written as the editor shows them (labels, display units), not as they are stored
// in the backend, so they are mostly strings.

type TargetVelocity =
  | { velocityType: 'Redshift'; redshift: string }
  | { velocityType: 'Velocity'; velocity: { value: string; unit: string } };

export type Target = {
  name: string;
  coordinateType: string;
  ra: string;
  dec: string;
} & TargetVelocity;

// Which fields an observation has depends on the observing mode
export interface Observation {
  centralFrequency: string;
  integrationTime: string;
  bandwidth?: string;
  numberOfChannels?: string;
  spectralResolution?: string;
  pstMode?: string;
}

export interface ImageDataProduct {
  imageSize: { value: string; unit: string };
  pixelSize: { value: string; unit: string };
  weighting: string;
  // Only for Briggs weighting
  robust?: string;
  polarisations: string[];
  channelsOut: string;
  continuumSubtraction?: boolean;
}

export interface VisibilitiesDataProduct {
  timeAveraging: string;
  frequencyAveraging: string;
}

export interface PstDataProduct {
  polarisations: string[];
  outputFrequencyResolution: string;
  outputSamplingInterval: string;
  bitDepth: string;
  dispersionMeasure: string;
  rotationMeasure: string;
}

// PST has a single data product; the other modes have images and, optionally, visibilities
export type DataProducts =
  { image: ImageDataProduct; visibilities?: VisibilitiesDataProduct } | { pst: PstDataProduct };

export interface ProposalFixture {
  title: string;
  details: { observingMode: string; abstract: string };
  description: { document: string };
  target: Target;
  observation: Observation;
  dataProducts: DataProducts;
  calibration: { calibrator: string; comment: string };
}

// The name is also the caption under the page's status indicator
export interface PageObject {
  name: string;
  heading: string;
  fill: (proposal: ProposalFixture) => void;
  verify: (proposal: ProposalFixture) => void;
}

// What differs between cycles: how the cycle is picked when creating a proposal, the messages
// shown once it has been created and validated, where the editor lands, and the pages a journey
// goes through.
export interface Cycle {
  option: RegExp;
  createdMessage: RegExp;
  validMessage: string;
  pageAfterCreate: PageObject;
  pageAfterOpen: PageObject;
  pages: PageObject[];
}
