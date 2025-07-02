import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2, Typography } from '@mui/material';
import { Document, Page } from 'react-pdf';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { pdfjs } from 'react-pdf';

import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import NextPageButton from '../../button/NextPage/NextPage';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFViewerProps {
  url?: string;
}

export default function PDFViewer({
  url = '../../../../public/how-to-conduct-your-own-heuristic-evaluation.pdf'
}: PDFViewerProps) {
  const { t } = useTranslation('pht');
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState(1);

  const onDocumentLoadSuccess = (numPages: number) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);

  const goToNextPage = () => setPageNumber(pageNumber + 1 >= numPages ? numPages : pageNumber + 1);

  const displayPages = () => {
    return (
      <Typography p={2} variant="body1">
        {numPages > 1 ? t('page.pageOf', { current: pageNumber, max: numPages }) : ''}
      </Typography>
    );
  };

  const displayNavigation = () => {
    return (
      <Grid2
        container
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Grid2>
          {numPages > 1 && (
            <PreviousPageButton
              disabled={pageNumber === 1}
              title={'page.previous'}
              action={goToPrevPage}
            />
          )}
        </Grid2>
        <Grid2>
          {numPages > 1 && (
            <NextPageButton
              disabled={pageNumber === numPages}
              title={'page.next'}
              action={goToNextPage}
            />
          )}
        </Grid2>
      </Grid2>
    );
  };

  return (
    <>
      <Grid2
        spacing={1}
        pl={1}
        pr={1}
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid2>{displayNavigation()}</Grid2>
        <Grid2>{displayPages()}</Grid2>
      </Grid2>

      <Grid2 container direction="row" justifyContent="center" alignItems="center">
        <Grid2>
          {url?.length > 0 && (
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
          )}
        </Grid2>
      </Grid2>
    </>
  );
}
