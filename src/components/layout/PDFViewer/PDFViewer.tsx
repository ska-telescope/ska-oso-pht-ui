import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFViewerProps {
  url?: string;
  width?: string;
  height?: string;
}

export default function PDFViewer({
  url = undefined,
  width = '90%',
  height = '80vh'
}: PDFViewerProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerPixelWidth, setContainerPixelWidth] = React.useState<number>(700);
  const [numPages, setNumPages] = React.useState<number>(0);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerPixelWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = React.useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoadError(null);
  }, []);

  const onDocumentLoadError = React.useCallback(
    (_error: Error) => {
      setLoadError(t('pdfViewer.error'));
    },
    [t]
  );

  return (
    <Box p={2} sx={{ backgroundColor: theme.palette.background.default }}>
      <Box
        ref={containerRef}
        sx={{
          width,
          height,
          margin: '0 auto',
          overflowY: 'auto',
          '& .pdf-dark canvas': {
            filter: 'invert(1) hue-rotate(180deg)'
          }
        }}
      >
        {url ? (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<Typography color="text.secondary">{t('pdfViewer.loading')}</Typography>}
            error={<Typography color="error">{loadError}</Typography>}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={containerPixelWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className={isDark ? 'pdf-dark' : ''}
              />
            ))}
          </Document>
        ) : (
          <Typography color="error">{t('pdfViewer.noFile')}</Typography>
        )}
      </Box>
    </Box>
  );
}
