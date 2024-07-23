export type DocumentBackend = {
  document_id?: string;
  link?: string;
  type?: string;
};

export type DocumentPDF = {
  documentId?: string;
  link?: string;
  file?: File;
};
