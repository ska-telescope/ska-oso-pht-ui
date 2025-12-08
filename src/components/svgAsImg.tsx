import React from 'react';

const SvgAsImg = ({ svgXml }) => {
  // Encode the SVG string into a data URI
  const svgBase64 = encodeURIComponent(svgXml)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  const dataUri = `data:image/svg+xml;utf8,${svgBase64}`;

  return <img src={dataUri} alt="Visibility Plot" width="100%" />;
};

export default SvgAsImg;
