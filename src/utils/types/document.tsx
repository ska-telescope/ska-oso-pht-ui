// export type DocumentBackend = {
//   document_id?: string;
//   link?: string;
//   type?: string;
// };

export type DocumentBackend = {
  document_id?: string;
  uploaded_pdf?: boolean;
};

// export type DocumentPDF = {
//   documentId?: string;
//   link?: string;
//   file?: File;
// };

export type DocumentPDF = {
  documentId?: string;
  isUploadedPdf?: boolean;
};
