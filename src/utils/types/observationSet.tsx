import type { ObservationSets } from '@/generated/models/observation-sets';
import type { SpectralLineSetup } from '@/generated/models/spectral-line-setup';
import type { ContinuumSetup } from '@/generated/models/continuum-setup';
import type { PstSetup } from '@/generated/models/pst-setup';

export type ObservationSetBackend = ObservationSets;

export type ObservationTypeDetailsSpectralBackend = SpectralLineSetup;

export type ObservationTypeDetailsContinuumBackend = ContinuumSetup;

export type ObservationTypeDetailsPSTBackend = PstSetup;
