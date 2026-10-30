import {
  enter,
  select,
  selectUnit,
  setChecked,
  verifyChecked,
  verifySelected,
  verifySelectedUnit
} from '../fields';
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
  options.forEach((p) => setChecked(p, selected.includes(p)));

const verifyPolarisations = (options: string[], selected: string[]) =>
  options.forEach((p) => verifyChecked(p, selected.includes(p)));

// For continuum, the user chooses between an images and a visibilities data product; choosing
// one resets the other to its defaults. The flows configure the images data product. The
// other image modes have no choice to make.
const fillImage = (mode: ObservingMode, image: ImageDataProduct) => {
  if (mode === 'Continuum') {
    select('Product type', 'Images');
  }
  enter(imageSizeField(), image.imageSize.value);
  selectUnit('Image Size', image.imageSize.unit);
  enter(pixelSizeField(), image.pixelSize.value);
  selectUnit('Pixel Size', image.pixelSize.unit);
  select('Image Weighting', image.weighting);
  if (image.weighting === 'Briggs') {
    enter(robustField(), image.robust ?? '');
  }
  // For spectral, the channels out follow from the observation and can't be edited
  if (mode === 'Spectral') {
    setChecked('Apply continuum subtraction?', image.continuumSubtraction ?? false);
  } else {
    enter(channelsOutField(), image.channelsOut);
  }
  setPolarisations(IMAGE_POLARISATIONS, image.polarisations);
};

const verifyImage = (mode: ObservingMode, image: ImageDataProduct) => {
  if (mode === 'Continuum') {
    verifySelected('Product type', 'Images');
  }
  imageSizeField().should('have.value', image.imageSize.value);
  verifySelectedUnit('Image Size', image.imageSize.unit);
  pixelSizeField().should('have.value', image.pixelSize.value);
  verifySelectedUnit('Pixel Size', image.pixelSize.unit);
  verifySelected('Image Weighting', image.weighting);
  if (image.weighting === 'Briggs') {
    robustField().should('have.value', image.robust);
  }
  channelsOutField().should('have.value', image.channelsOut);
  if (mode === 'Spectral') {
    verifyChecked('Apply continuum subtraction?', image.continuumSubtraction ?? false);
  }
  verifyPolarisations(IMAGE_POLARISATIONS, image.polarisations);
};

// The fields shown for PST depend on the observation's PST mode. The flows use the detected
// filterbank, which has the most fields.
const fillPst = (pst: PstDataProduct) => {
  enter(outputFrequencyResolutionField(), pst.outputFrequencyResolution);
  enter(outputSamplingIntervalField(), pst.outputSamplingInterval);
  select('Bit Depth', pst.bitDepth);
  enter(dispersionMeasureField(), pst.dispersionMeasure);
  enter(rotationMeasureField(), pst.rotationMeasure);
  setPolarisations(PST_POLARISATIONS, pst.polarisations);
};

const verifyPst = (pst: PstDataProduct) => {
  outputFrequencyResolutionField().should('have.value', pst.outputFrequencyResolution);
  outputSamplingIntervalField().should('have.value', pst.outputSamplingInterval);
  verifySelected('Bit Depth', pst.bitDepth);
  dispersionMeasureField().should('have.value', pst.dispersionMeasure);
  rotationMeasureField().should('have.value', pst.rotationMeasure);
  verifyPolarisations(PST_POLARISATIONS, pst.polarisations);
};

export const dataProductPage: PageObject = {
  name: 'Data Product',
  heading: 'OBSERVATORY DATA PRODUCT',
  pageValidationError: 'The DATA PRODUCTS page is not complete',
  fill: ({ details, dataProducts }: ProposalFixture) =>
    'pst' in dataProducts
      ? fillPst(dataProducts.pst)
      : fillImage(details.observingMode, dataProducts.image),
  verify: ({ details, dataProducts }: ProposalFixture) =>
    'pst' in dataProducts
      ? verifyPst(dataProducts.pst)
      : verifyImage(details.observingMode, dataProducts.image)
};
