import { describe, expect, test } from 'vitest';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '@/utils/constants';
import {
  documentsFromPdm,
  documentsToPdm,
  getDocumentPageStatus,
  getDocumentValues,
  isSameDocumentRef
} from './documents';
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

  test('defaults missing values to null', () => {
    expect(getDocumentValues(undefined)).toEqual({
      sciencePDF: null,
      scienceLoadStatus: null,
      technicalPDF: null,
      technicalLoadStatus: null
    });
  });

  test('maps references back to PDM documents', () => {
    expect(
      documentsToPdm(
        {
          sciencePDF: { documentId: 'science-doc-p1', isUploadedPdf: true },
          technicalPDF: { documentId: 'technical-doc-p1', isUploadedPdf: false }
        },
        []
      )
    ).toEqual([science, technical]);
  });

  test('a null reference removes the document and undefined keeps the base one', () => {
    expect(documentsToPdm({ sciencePDF: null }, [science, technical])).toEqual([technical]);
    expect(documentsToPdm({}, [science, technical])).toEqual([science, technical]);
  });

  test('page status follows the reference and upload state', () => {
    expect(getDocumentPageStatus(null)).toBe(STATUS_ERROR);
    expect(getDocumentPageStatus({ documentId: 'x', isUploadedPdf: false })).toBe(STATUS_PARTIAL);
    expect(getDocumentPageStatus({ documentId: 'x', isUploadedPdf: true })).toBe(STATUS_OK);
  });

  test('compares references by value', () => {
    expect(isSameDocumentRef(null, undefined)).toBe(true);
    expect(isSameDocumentRef({ documentId: 'a' }, { documentId: 'a' })).toBe(true);
    expect(isSameDocumentRef({ documentId: 'a' }, null)).toBe(false);
  });

  test('round-trips PDM with documents through the form unchanged', () => {
    const withDocs = withDocuments([science, technical]);
    expect(mapFormToPdm(mapPdmToForm(withDocs), withDocs)).toEqual(withDocs);
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
