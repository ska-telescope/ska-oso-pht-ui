import katex from 'katex';
import 'katex/dist/katex.min.css';

type Delimiter = { left: string; right: string; display: boolean };
type Fragment = { type: 'text' | 'math'; data: string; display?: boolean };

const DELIMITERS: Delimiter[] = [
  { left: '$$', right: '$$', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '$', right: '$', display: false },
  { left: '\\[', right: '\\]', display: true }
];

const findEndOfMath = (delimiter: string, text: string, startIndex: number): number => {
  let index = startIndex;
  let braceLevel = 0;
  while (index < text.length) {
    const character = text[index];
    if (braceLevel <= 0 && text.slice(index, index + delimiter.length) === delimiter) {
      return index;
    } else if (character === '\\') {
      index++;
    } else if (character === '{') {
      braceLevel++;
    } else if (character === '}') {
      braceLevel--;
    }
    index++;
  }
  return -1;
};

const escapeRegex = (value: string): string => value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

const amsRegex = /^\\begin{/;

const splitAtDelimiters = (input: string, delimiters: Delimiter[]): Fragment[] => {
  const fragments: Fragment[] = [];
  const regexLeft = new RegExp('(' + delimiters.map((d) => escapeRegex(d.left)).join('|') + ')');
  let text = input;
  for (;;) {
    let index = text.search(regexLeft);
    if (index === -1) break;
    if (index > 0) {
      fragments.push({ type: 'text', data: text.slice(0, index) });
      text = text.slice(index);
    }
    const delimiter = delimiters.find((d) => text.startsWith(d.left))!;
    index = findEndOfMath(delimiter.right, text, delimiter.left.length);
    if (index === -1) break;
    const rawData = text.slice(0, index + delimiter.right.length);
    const math = amsRegex.test(rawData) ? rawData : text.slice(delimiter.left.length, index);
    fragments.push({ type: 'math', data: math, display: delimiter.display });
    text = text.slice(index + delimiter.right.length);
  }
  if (text !== '') fragments.push({ type: 'text', data: text });
  return fragments;
};

const renderMath = (math: string, displayMode: boolean): string | null => {
  try {
    return katex.renderToString(math, { displayMode });
  } catch {
    return null;
  }
};

export default function Latex({ children }: { children: string }) {
  return (
    <span>
      {splitAtDelimiters(children, DELIMITERS).map((fragment, index) => {
        if (fragment.type === 'text') return fragment.data;
        const html = renderMath(fragment.data, fragment.display ?? false);
        return html === null ? (
          fragment.data
        ) : (
          <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
        );
      })}
    </span>
  );
}
