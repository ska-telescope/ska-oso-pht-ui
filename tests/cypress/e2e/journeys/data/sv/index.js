// The SV proposals the journeys create, one per observing mode, each in its own file. Each page
// module's fill() enters these values and its verify() checks them, so these files are the single
// place the expected proposals are described.
//
// Values are written as the editor shows them (labels, display units), not as they are stored
// in the backend.
//
// Titles are unique per run because local runs can point at shared backends that already hold
// proposals from earlier runs, and there's no API for deleting them.
//
// SV fixes the band, subarray and supplied type, and hides the number of stations and the
// elevation, so the observations only list the remaining fields.

import { buildSvContinuumProposal } from './continuum';
import { buildSvContinuumSpectralProposal } from './continuumSpectral';
import { buildSvSpectralProposal } from './spectral';
import { buildSvPstProposal } from './pst';

export {
  buildSvContinuumProposal,
  buildSvContinuumSpectralProposal,
  buildSvSpectralProposal,
  buildSvPstProposal
};

export const SV_PROPOSALS = [
  buildSvContinuumProposal,
  buildSvContinuumSpectralProposal,
  buildSvSpectralProposal,
  buildSvPstProposal
];
