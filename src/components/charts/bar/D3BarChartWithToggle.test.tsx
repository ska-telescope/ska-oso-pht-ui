import React from 'react';
import { render, screen } from '@testing-library/react';
import D3BarChartWithToggle from './D3BarChartWithToggle'; // Adjust path if needed

// Mock props
const mockData = [
  { category: 'Fruit', type: 'Apples', value: 10 },
  { category: 'Fruit', type: 'Bananas', value: 15 },
  { category: 'Vegetable', type: 'Carrots', value: 8 }
];

const groupByOptions = ['category', 'type'];
const allFields = ['Apples', 'Bananas', 'Carrots'];

describe('D3BarChartWithToggle', () => {
  it('renders groupBy and field selectors', () => {
    render(
      <D3BarChartWithToggle data={mockData} groupByOptions={groupByOptions} allFields={allFields} />
    );

    // Check that the groupBy selector is rendered
    const groupBySelect = screen.getByDisplayValue('category');
    expect(groupBySelect).toBeInTheDocument();

    // Check that the field selector is rendered
    const fieldSelect = screen.getByRole('listbox');
    expect(fieldSelect).toBeInTheDocument();

    // Check that each field label appears at least once
    allFields.forEach(field => {
      const matches = screen.getAllByText(field);
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
