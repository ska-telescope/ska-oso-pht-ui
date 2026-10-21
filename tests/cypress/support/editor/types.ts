// Types for the proposal fixtures and the page objects that enter and check them.
//
// Values are written as the editor shows them (labels, display units), not as they are stored
// in the backend, so they are mostly strings.

// As labelled in the Details page's dropdown
export type ObservingMode = 'Continuum' | 'Continuum-Spectral' | 'Spectral' | 'PST';

type TargetVelocity =
  | { velocityType: 'Redshift'; redshift: string }
  | { velocityType: 'Velocity'; velocity: { value: string; unit: string } };

export type Target = {
  name: string;
  coordinateType: string;
  ra: string;
  dec: string;
} & TargetVelocity;

// Which fields an observation has depends on the observing mode: spectral has a number of
// channels and a spectral resolution instead of a bandwidth, and PST also has a PST mode
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
  // For spectral, this shows the observation's number of channels and can't be edited
  channelsOut: string;
  // Only for spectral
  continuumSubtraction?: boolean;
}

export interface PstDataProduct {
  polarisations: string[];
  outputFrequencyResolution: string;
  outputSamplingInterval: string;
  bitDepth: string;
  dispersionMeasure: string;
  rotationMeasure: string;
}

// PST has its own data product; the other modes have images. (Continuum can have visibilities
// instead, but the journeys don't cover that.)
export type DataProducts = { image: ImageDataProduct } | { pst: PstDataProduct };

export interface ProposalFixture {
  title: string;
  details: { observingMode: ObservingMode; abstract: string };
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
