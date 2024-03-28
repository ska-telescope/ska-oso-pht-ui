/*
  returns string such as 'LOW_AA4_all',
  */
export function getLowSubarrayType(_subArray: string, telescope: string): string {
  let subArray = _subArray.replace('*', '').replace('(core only)', ''); // remove * // remove (core only)
  subArray = subArray.replace(/(\d+)\.(\d+)/g, '$1$2'); // remove dot following a number
  const star = _subArray.includes('*') ? 'star' : ''; // add star for *
  const type = _subArray.includes('core') ? 'core_only' : 'all';
  return `${telescope}_${subArray}${star}_${type}`.replace(' ', '');
}
