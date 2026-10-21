import { enter, select, setChecked, verifyChecked, verifySelected } from '../fields';
import type {
  ImageDataProduct,
  ObservingMode,
  PageObject,
  ProposalFixture,
  PstDataProduct
} from '../types';

// The polarisations offered for images, and for PST's detected filterbank
const IMAGE_POLARISATIONS = ['I', 'Q', 'U', 'V', 'XX', 'XY', 'YX', 'YY'];
const PST_POLARISATIONS = ['I', 'Q', 'U', 'V'];

const imageSizeField = () => cy.findByRole('textbox', { name: 'Image Size' });
const pixelSizeField = () => cy.findByRole('textbox', { name: 'Pixel Size' });
const robustField = () => cy.findByRole('textbox', { name: 'Robust' });
const channelsOutField = () => cy.findByRole('spinbutton', { name: 'Channels Out' });

const outputFrequencyResolutionField = () =>
  cy.findByRole('spinbutton', { name: 'Output frequency resolution' });
const outputSamplingIntervalField = () =>
  cy.findByRole('spinbutton', { name: 'Output sampling interval' });
const dispersionMeasureField = () => cy.findByRole('textbox', { name: 'Dispersion Measure' });
const rotationMeasureField = () => cy.findByRole('textbox', { name: 'Rotation Measure' });

const setPolarisations = (options: string[], selected: string[]) =>
  options.forEach((p) => setChecked(`polarisations${p}`, selected.includes(p)));

const verifyPolarisations = (options: string[], selected: string[]) =>
  options.forEach((p) => verifyChecked(`polarisations${p}`, selected.includes(p)));

// For continuum, the user chooses between an images and a visibilities data product; choosing
// one resets the other to its defaults. The journeys configure the images data product. The
// other image modes have no choice to make.
const fillImage = (mode: ObservingMode, image: ImageDataProduct) => {
  if (mode === 'Continuum') {
    select('dataProductType', 'Images');
  }
  enter(imageSizeField(), image.imageSize.value);
  select('imageSizeUnits', image.imageSize.unit);
  enter(pixelSizeField(), image.pixelSize.value);
  select('pixelSizeUnits', image.pixelSize.unit);
  select('imageWeighting', image.weighting);
  if (image.weighting === 'Briggs') {
    enter(robustField(), image.robust ?? '');
  }
  // For spectral, the channels out follow from the observation and can't be edited
  if (mode === 'Spectral') {
    setChecked('continuumSubtraction', image.continuumSubtraction ?? false);
  } else {
    enter(channelsOutField(), image.channelsOut);
  }
  setPolarisations(IMAGE_POLARISATIONS, image.polarisations);
};

const verifyImage = (mode: ObservingMode, image: ImageDataProduct) => {
  if (mode === 'Continuum') {
    verifySelected('dataProductType', 'Images');
  }
  imageSizeField().should('have.value', image.imageSize.value);
  verifySelected('imageSizeUnits', image.imageSize.unit);
  pixelSizeField().should('have.value', image.pixelSize.value);
  verifySelected('pixelSizeUnits', image.pixelSize.unit);
  verifySelected('imageWeighting', image.weighting);
  if (image.weighting === 'Briggs') {
    robustField().should('have.value', image.robust);
  }
  channelsOutField().should('have.value', image.channelsOut);
  if (mode === 'Spectral') {
    verifyChecked('continuumSubtraction', image.continuumSubtraction ?? false);
  }
  verifyPolarisations(IMAGE_POLARISATIONS, image.polarisations);
};

// The fields shown for PST depend on the observation's PST mode. The journeys use the detected
// filterbank, which has the most fields.
const fillPst = (pst: PstDataProduct) => {
  enter(outputFrequencyResolutionField(), pst.outputFrequencyResolution);
  enter(outputSamplingIntervalField(), pst.outputSamplingInterval);
  select('bitDepth', pst.bitDepth);
  enter(dispersionMeasureField(), pst.dispersionMeasure);
  enter(rotationMeasureField(), pst.rotationMeasure);
  setPolarisations(PST_POLARISATIONS, pst.polarisations);
};

const verifyPst = (pst: PstDataProduct) => {
  outputFrequencyResolutionField().should('have.value', pst.outputFrequencyResolution);
  outputSamplingIntervalField().should('have.value', pst.outputSamplingInterval);
  verifySelected('bitDepth', pst.bitDepth);
  dispersionMeasureField().should('have.value', pst.dispersionMeasure);
  rotationMeasureField().should('have.value', pst.rotationMeasure);
  verifyPolarisations(PST_POLARISATIONS, pst.polarisations);
};

export const dataProductPage: PageObject = {
  name: 'Data Product',
  heading: 'OBSERVATORY DATA PRODUCT',
  fill: ({ details, dataProducts }: ProposalFixture) =>
    'pst' in dataProducts
      ? fillPst(dataProducts.pst)
      : fillImage(details.observingMode, dataProducts.image),
  verify: ({ details, dataProducts }: ProposalFixture) =>
    'pst' in dataProducts
      ? verifyPst(dataProducts.pst)
      : verifyImage(details.observingMode, dataProducts.image)
};
