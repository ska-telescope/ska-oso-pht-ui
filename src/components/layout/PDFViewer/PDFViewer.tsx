import React from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import NextPageButton from '../../button/NextPage/NextPage';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFViewerProps {
  url?: string;
}

export default function PDFViewer({
  url = '/how-to-conduct-your-own-heuristic-evaluation.pdf'
}: PDFViewerProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(700);
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === 'ArrowLeft') goToPrevPage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [numPages, pageNumber]);

  const onDocumentLoadSuccess = React.useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadError(null);
  }, []);

  const onDocumentLoadError = React.useCallback(
    (_error: Error) => {
      setLoadError(t('pdfViewer.error'));
    },
    [t]
  );

  const goToPrevPage = React.useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = React.useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  }, [numPages]);

  return (
    <Box p={2} sx={{ backgroundColor: theme.palette.background.default }}>
      <Grid container spacing={1} px={1} alignItems="center" justifyContent="space-between">
        <Grid>
          {numPages > 1 && (
            <PreviousPageButton
              disabled={pageNumber === 1}
              title={'page.previous'}
              action={goToPrevPage}
              aria-label={t('page.previous')}
            />
          )}
        </Grid>
        <Grid>
          {numPages > 1 && (
            <Typography variant="body1" color="text.primary">
              {t('page.pageOf', { current: pageNumber, max: numPages })}
            </Typography>
          )}
        </Grid>
        <Grid>
          {numPages > 1 && (
            <NextPageButton
              disabled={pageNumber === numPages}
              title={'page.next'}
              action={goToNextPage}
              aria-label={t('page.next')}
            />
          )}
        </Grid>
      </Grid>

      <Box mt={2} display="flex" justifyContent="center">
        <Box
          ref={containerRef}
          sx={{
            width: '90%',
            maxWidth: 800,
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
              <Page
                pageNumber={pageNumber}
                width={containerWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className={isDark ? 'pdf-dark' : ''}
              />
            </Document>
          ) : (
            <Typography color="error">{t('pdfViewer.noFile')}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
