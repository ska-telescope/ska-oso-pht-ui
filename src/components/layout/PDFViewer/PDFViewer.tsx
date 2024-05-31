import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, Grid } from '@mui/material';
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

  return (
    <Card>
      <CardHeader
        title={file ? file : t('pdfPreview.label')}
        titleTypographyProps={{
          align: 'center',
          fontWeight: 'bold',
          variant: 'h5'
        }}
        subheader={
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
            <Grid>
              {numPages > 1 ? t('page.pageOf', { current: pageNumber, max: numPages }) : ''}
            </Grid>
            <Grid>
              {numPages > 1 && (
                <NextPageButton
                  disabled={pageNumber === numPages}
                  label={t('page.next')}
                  action={goToNextPage}
                />
              )}
            </Grid>
          </Grid>
        }
      />
      <CardContent>
        {file?.length > 0 && (
          <Document file={LOCAL_PREFIX + file} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} />
          </Document>
        )}
      </CardContent>
    </Card>
  );
}
