import { enter, select, setChecked, verifyChecked, verifySelected } from '../fields';
import type { ImageDataProduct, PageObject, ProposalFixture } from '../types';

const POLARISATIONS = ['I', 'Q', 'U', 'V', 'XX', 'XY', 'YX', 'YY'];

const imageSizeField = () => cy.findByRole('textbox', { name: 'Image Size' });
const pixelSizeField = () => cy.findByRole('textbox', { name: 'Pixel Size' });
const robustField = () => cy.findByRole('textbox', { name: 'Robust' });
const channelsOutField = () => cy.findByRole('spinbutton', { name: 'Channels Out' });

// For continuum, the user chooses between an images and a visibilities data product; choosing
// one resets the other to its defaults. The journeys configure the images data product.
// The journeys only configure images so far
const imageOf = ({ dataProducts }: ProposalFixture): ImageDataProduct => {
  if (!('image' in dataProducts)) {
    throw new Error('Only image data products can be entered so far');
  }
  return dataProducts.image;
};

export const dataProductPage: PageObject = {
  name: 'Data Product',
  heading: 'OBSERVATORY DATA PRODUCT',
  fill: (proposal) => {
    const image = imageOf(proposal);
    select('dataProductType', 'Images');
    enter(imageSizeField(), image.imageSize.value);
    select('imageSizeUnits', image.imageSize.unit);
    enter(pixelSizeField(), image.pixelSize.value);
    select('pixelSizeUnits', image.pixelSize.unit);
    select('imageWeighting', image.weighting);
    if (image.weighting === 'Briggs') {
      enter(robustField(), image.robust ?? '');
    }
    enter(channelsOutField(), image.channelsOut);
    POLARISATIONS.forEach((p) => setChecked(`polarisations${p}`, image.polarisations.includes(p)));
  },
  verify: (proposal) => {
    const image = imageOf(proposal);
    verifySelected('dataProductType', 'Images');
    imageSizeField().should('have.value', image.imageSize.value);
    verifySelected('imageSizeUnits', image.imageSize.unit);
    pixelSizeField().should('have.value', image.pixelSize.value);
    verifySelected('pixelSizeUnits', image.pixelSize.unit);
    verifySelected('imageWeighting', image.weighting);
    if (image.weighting === 'Briggs') {
      robustField().should('have.value', image.robust);
    }
    channelsOutField().should('have.value', image.channelsOut);
    POLARISATIONS.forEach((p) =>
      verifyChecked(`polarisations${p}`, image.polarisations.includes(p))
    );
  }
};
