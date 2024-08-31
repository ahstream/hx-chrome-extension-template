import { countBy, maxBy, sum } from 'lodash';

export function mostFrequent(arr) {
  let freq = countBy(arr);
  return maxBy(Object.keys(freq), (o) => freq[o]);
}

export const _sum = (arr) => sum(arr);
