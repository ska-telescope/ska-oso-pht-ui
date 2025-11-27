import React from 'react';

const SvgRenderer = ({ svgXml }) => {
  return (
    <div
      // Inject the raw SVG string into the DOM
      dangerouslySetInnerHTML={{ __html: svgXml }}
    />
  );
};

export default SvgRenderer;
