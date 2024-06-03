import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Grid, Typography } from '@mui/material';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import NextPageButton from '../../button/NextPage/NextPage';

const LOCAL_PREFIX = 'http://localhost:6101/';

// FREE TO USE REFERENCE FILE.
// const getPreviewName = () => 'https://www.orimi.com/pdf-test.pdf';

interface PDFViewerProps {
  file: string;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const { t } = useTranslation('pht');
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);

  const goToNextPage = () => setPageNumber(pageNumber + 1 >= numPages ? numPages : pageNumber + 1);

  const displayTitle = () => {
    return <Typography variant="h5">{file ? file : t('pdfPreview.label')}</Typography>;
  };

  const displayNavigation = () => {
    return (
      <Grid
        spacing={1}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-between"
      >
        <Grid item>
          {numPages > 1 && (
            <PreviousPageButton
              disabled={pageNumber === 1}
              label={t('page.previous')}
              action={goToPrevPage}
            />
          )}
        </Grid>
        <Grid item>
          {numPages > 1 ? t('page.pageOf', { current: pageNumber, max: numPages }) : ''}
        </Grid>
        <Grid item>
          {numPages > 1 && (
            <NextPageButton
              disabled={pageNumber === numPages}
              label={t('page.next')}
              action={goToNextPage}
            />
          )}
        </Grid>
      </Grid>
    );
  };

  return (
    <Card>
      <Grid
        spacing={1}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <Grid item>{displayTitle()}</Grid>
        <Grid item xs={8}>
          {displayNavigation()}
        </Grid>
        <Grid item>
          {file?.length > 0 && (
            <Document file={LOCAL_PREFIX + file} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
          )}
        </Grid>
      </Grid>
    </Card>
  );
}
