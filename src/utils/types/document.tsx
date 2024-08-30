export type DocumentBackend = {
  document_id?: string;
  // link?: string;
  uploadPdf: boolean; // TODO replace link by uploadPdf in mapping // How???
  type?: string;
};

export type DocumentPDF = {
  documentId?: string;
  link?: string;
  file?: File;
};
