import React from 'react';
import { Box } from '@mui/material';
import Target from '@/utils/types/target';
import GetVisibility from '@services/axios/get/getVisibilitySVG/getVisibilitySVG.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface VisualizationProps {
  target: Target | undefined;
  show?: boolean;
}

const FIELD = 'visualization.';

export default function Visualization({ target, show }: VisualizationProps) {
  const [visibilitySVG, setVisibilitySVG] = React.useState<string | null>(null);
  const { t } = useScopedTranslation();

  React.useEffect(() => {
    if (!target) {
      setVisibilitySVG(null);
      return;
    }

    const { raStr: ra, decStr: dec } = target;

    if (
      show &&
      typeof ra === 'string' &&
      typeof dec === 'string' &&
      ra.length > 0 &&
      dec.length > 0
    ) {
      setVisibilitySVG(null); // reset while loading

      GetVisibility(ra, dec, 'LOW').then(response => {
        if (response && typeof response === 'object' && 'data' in response) {
          setVisibilitySVG(response.data);
        } else {
          setVisibilitySVG(null);
        }
      });
    }
  }, [target, show]);

  return (
    <>
      {show && target ? (
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {visibilitySVG ? (
            <SvgAsImg svgXml={visibilitySVG} />
          ) : (
            <Box sx={{ opacity: 0.6 }}>{t(FIELD + 'loading')}</Box>
          )}
        </Box>
      ) : null}
    </>
  );
}

/* ----------------------------------------------------------
   Local helper component: SvgAsImg
   ---------------------------------------------------------- */

function SvgAsImg({ svgXml }: { svgXml: string }) {
  const svgEncoded = encodeURIComponent(svgXml)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  const dataUri = `data:image/svg+xml;utf8,${svgEncoded}`;

  return <img src={dataUri} alt="Visibility Plot" width="100%" />;
}
