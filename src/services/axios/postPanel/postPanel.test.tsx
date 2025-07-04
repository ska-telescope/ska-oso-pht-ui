import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { mappingPostPanel, postMockPanel } from './postPanel';
import { MockPanelFrontend } from './mockPanelFrontend';
import { MockPanelBackend } from './mockPanelBackend';
import { PanelBackend } from '@/utils/types/panel';

describe('Helper Functions', () => {
  test('postMockPanel returns mock id', () => {
    const result = postMockPanel();
    expect(result).to.equal('PANEL-ID-001');
  });

  test('mappingPostPanel returns mapped panel from frontend to backend format', () => {
    const panelBackEnd: PanelBackend = mappingPostPanel(MockPanelFrontend);
    expect(panelBackEnd).to.deep.equal(MockPanelBackend);
  });

  // TODO: add more tests for rest of postPanel service
});
