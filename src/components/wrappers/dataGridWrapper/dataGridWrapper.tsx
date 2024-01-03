/* eslint-disable @typescript-eslint/no-explicit-any */

'use Client';

import React from 'react';
import { DataGrid } from '@ska-telescope/ska-gui-components';

interface DataGridWrapperProps {
  rows: any;
  extendedColumns: any;
  height: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  rowClick?: Function;
  testId?: string;
}

export default function DataGridWrapper({
  rows,
  extendedColumns,
  height,
  rowClick,
  testId
}: DataGridWrapperProps) {
  return (
    <DataGrid
      testId={testId}
      columns={extendedColumns}
      height={height}
      onRowClick={rowClick}
      rows={rows}
    />
  );
}
