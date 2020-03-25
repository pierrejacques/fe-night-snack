export const catchFromURL = (key) => {
  const { origin, pathname, search, hash } = document.location;
  const prevSearch = search.substring(1);
  let output = '';
  const nextSearch = prevSearch.split('&').map((pair) => {
    const splitPair = pair.split('=');
    if (splitPair[0] === key) {
      output = splitPair[1];
      return '';
    }
    return pair;
  }).filter(v => v).join('&');
  const nextHref = origin + pathname + (nextSearch ? `?${nextSearch}` : '') + hash;
  history.replaceState(null, '', nextHref);
  return output;
}
