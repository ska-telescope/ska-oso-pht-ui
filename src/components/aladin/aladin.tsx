import React, { useEffect } from 'react';
import $ from 'jquery'; // Import jQuery

const AladinLiteComponent = () => {
  useEffect(() => {
    const loadAladinLite = async () => {
      try {
        // Dynamically load Aladin Lite script
        const aladinLiteScript = document.createElement('script');
        aladinLiteScript.src = 'https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js';
        aladinLiteScript.charset = 'utf-8';
        aladinLiteScript.async = true;
        document.head.appendChild(aladinLiteScript);

        // Wait for Aladin Lite script to be loaded
        await new Promise((resolve) => {
          aladinLiteScript.onload = resolve;
        });

        // Create Aladin Lite instance when the script is loaded
        window.A.init.then(() => {
          const aladin = window.A.aladin('#aladin-lite-div', { survey: "P/DSS2/color", fov: 1.5, target: "M 20" });

          $('input[name=survey]').change(function () {
            aladin.setImageSurvey($(this).val());
          });

          var marker1 = window.A.marker(270.332621, -23.078944, { popupTitle: 'PSR B1758-23', popupDesc: 'Object type: Pulsar' });
          var marker2 = window.A.marker(270.63206, -22.905550, { popupTitle: 'HD 164514', popupDesc: 'Object type: Star in cluster' });
          var marker3 = window.A.marker(270.598121, -23.030819, { popupTitle: 'HD 164492', popupDesc: 'Object type: Double star' });
          var markerLayer = window.A.catalog({ color: '#800080' });
          aladin.addCatalog(markerLayer);
          markerLayer.addSources([marker1, marker2, marker3]);

          aladin.addCatalog(window.A.catalogFromSimbad('M 20', 0.2, { shape: 'plus', color: '#5d5', onClick: 'showTable' }));
          aladin.addCatalog(window.A.catalogFromVizieR('J/ApJ/562/446/table13', 'M 20', 0.2, { shape: 'square', sourceSize: 8, color: 'red', onClick: 'showPopup' }));

          var footprintLayer = window.A.graphicOverlay({ color: '#2345ee', lineWidth: 3 });
          aladin.addOverlay(footprintLayer);
          footprintLayer.addFootprints([window.A.polygon([[270.62172, -23.04858], [270.59267, -23.08082], [270.62702, -23.10701], [270.64113, -23.09075], [270.63242, -23.08376], [270.63868, -23.07631], [270.63131, -23.07021], [270.63867, -23.06175]])]);
        });
      } catch (error) {
        console.error('Error loading Aladin Lite:', error);
      }
    };

    loadAladinLite();

    return () => {
      // Clean up if necessary
    };
  }, []);

  return (
    <div>
      <h1>Trifid interactive map</h1>
      <div id="aladin-lite-div" style={{ width: '700px', height: '400px' }}></div>
      <input id="DSS" type="radio" name="survey" value="P/DSS2/color" defaultChecked /><label htmlFor="DSS">DSS color</label>
      <input id="DSS-blue" type="radio" name="survey" value="P/DSS2/blue" /><label htmlFor="DSS-blue">DSS blue</label>
      <input id="2MASS" type="radio" name="survey" value="P/2MASS/color" /><label htmlFor="2MASS">2MASS</label>
      <input id="allwise" type="radio" name="survey" value="P/allWISE/color" /><label htmlFor="allwise">AllWISE</label>
      <input id="glimpse" type="radio" name="survey" value="P/GLIMPSE360" /><label htmlFor="glimpse">GLIMPSE 360</label>
    </div>
  );
};

export default AladinLiteComponent;
