import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import Latex from './Latex';

describe('Latex', () => {
  test('renders delimited maths with KaTeX and keeps surrounding text', () => {
    const { container } = render(<Latex>{'Ratio $\\frac{1}{2}$ of sources'}</Latex>);
    expect(container.querySelector('.katex .mfrac')).toBeInTheDocument();
    expect(container.textContent).toContain('Ratio ');
    expect(container.textContent).toContain(' of sources');
  });

  test('renders display maths', () => {
    const { container } = render(<Latex>{'$$x^2$$'}</Latex>);
    expect(container.querySelector('.katex-display')).toBeInTheDocument();
  });

  test('treats HTML in the text as text', () => {
    const { container } = render(<Latex>{'<img src="x" onerror="alert(1)"> $x$'}</Latex>);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src="x" onerror="alert(1)">');
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });

  test('leaves unterminated maths as plain text', () => {
    const { container } = render(<Latex>{'Broken $\\frac{1}{$ <b>bold</b>'}</Latex>);
    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toBe('Broken $\\frac{1}{$ <b>bold</b>');
  });

  test('shows maths that KaTeX cannot parse as plain text', () => {
    const { container } = render(<Latex>{'Bad $\\frac{1}$ <i>x</i>'}</Latex>);
    expect(container.querySelector('.katex')).toBeNull();
    expect(container.querySelector('i')).toBeNull();
    expect(container.textContent).toBe('Bad \\frac{1} <i>x</i>');
  });

  test('updates when the text changes', () => {
    const { container, rerender } = render(<Latex>{'first'}</Latex>);
    rerender(<Latex>{'second $y$'}</Latex>);
    expect(container.textContent).toContain('second');
    expect(container.textContent).not.toContain('first');
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });
});
