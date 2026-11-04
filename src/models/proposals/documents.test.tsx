import { describe, expect, test } from 'vitest';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '@/utils/constants';
import { documentsFromPdm, documentsToPdm, getDocumentPageStatus } from './documents';
import { mapFormToPdm, mapPdmToForm } from './pdmMapper';

const science = { document_id: 'science-doc-p1', uploaded_pdf: true };
const technical = { document_id: 'technical-doc-p1', uploaded_pdf: false };
const pdm = MockProposalBackend as ProposalBackend;
const withDocuments = (documents: typeof pdm.observation_info.documents) =>
  ({ ...pdm, observation_info: { ...pdm.observation_info, documents } }) as ProposalBackend;

describe('documents slice', () => {
  test('maps PDM documents to references by prefix', () => {
    expect(documentsFromPdm([technical, science])).toEqual({
      sciencePDF: { documentId: 'science-doc-p1', isUploadedPdf: true },
      technicalPDF: { documentId: 'technical-doc-p1', isUploadedPdf: false }
    });
    expect(documentsFromPdm(undefined)).toEqual({ sciencePDF: null, technicalPDF: null });
  });

  test('maps references back to PDM documents', () => {
    expect(
      documentsToPdm({
        sciencePDF: { documentId: 'science-doc-p1', isUploadedPdf: true },
        technicalPDF: { documentId: 'technical-doc-p1', isUploadedPdf: false }
      })
    ).toEqual([science, technical]);
  });

  test('a null reference produces no document', () => {
    expect(documentsToPdm({ sciencePDF: null, technicalPDF: null })).toEqual([]);
  });

  test('page status follows the reference and upload state', () => {
    expect(getDocumentPageStatus(null)).toBe(STATUS_ERROR);
    expect(getDocumentPageStatus({ documentId: 'x', isUploadedPdf: false })).toBe(STATUS_PARTIAL);
    expect(getDocumentPageStatus({ documentId: 'x', isUploadedPdf: true })).toBe(STATUS_OK);
  });

  // Only the documents: targets also go through the form, and are saved without the fields the
  // PHT does not use
  test('round-trips PDM documents through the form unchanged', () => {
    const withDocs = withDocuments([science, technical]);
    expect(mapFormToPdm(mapPdmToForm(withDocs), withDocs).observation_info.documents).toEqual(
      withDocs.observation_info.documents
    );
  });

  test('form document changes reach the PDM', () => {
    const base = withDocuments([science]);
    const form = {
      ...mapPdmToForm(base),
      sciencePDF: { documentId: 'science-doc-p1', isUploadedPdf: false }
    };
    expect(mapFormToPdm(form, base).observation_info.documents).toEqual([
      { document_id: 'science-doc-p1', uploaded_pdf: false }
    ]);
  });
});
