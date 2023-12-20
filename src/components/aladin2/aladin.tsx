import React, { useEffect, useRef } from 'react';
import 'aladin-lite'; // Import Aladin Lite library

const AladinLiteComponent = () => {
  const aladinDivRef = useRef(null);

  useEffect(() => {
    if (aladinDivRef.current) {
      // Use the window object to access the Aladin Lite library
      const aladin = window.A.aladin(aladinDivRef.current, {
        survey: 'P/DSS2/color',
        fov: 1.5,
      });
      // Optionally manipulate the Aladin Lite instance here
    }
  }, []);

  return <div ref={aladinDivRef} style={{ width: '800px', height: '600px' }} />;
};

export default AladinLiteComponent;
