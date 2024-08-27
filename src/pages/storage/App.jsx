import React from 'react';
import { useState, useEffect } from 'react';
import PageLayout from '@components/pageLayout/PageLayout.jsx';
import { loadStorage, round, dynamicSort } from '@ahstream/hx-lib';
import './storage.scss';

export default function App() {
  console.log('App start');

  const [pageInitialized, setPageInitialized] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [storage, setStorage] = useState(null);
  console.log('useState storage:', storage);

  useEffect(() => {
    async function initPage() {
      try {
        setStorage(await loadStorage({ keys: [] }));
        setPageInitialized(true);
        setPageLoading(false);
        console.log('initPage storage:', storage);
      } catch (error) {
        setPageError(error);
        setPageLoading(false);
      }
    }
    initPage();
  }, []);

  return (
    <>
      {pageLoading && <span>Loading ...</span>}
      {pageError && <span className="text-red-700">{`Error: ${pageError}`}</span>}
      {pageInitialized && (
        <PageLayout pageTitle="Storage used by extension">
          <Stats obj={storage} name="storage" />
        </PageLayout>
      )}
    </>
  );
}

function Stats({ obj, name }) {
  const sizeTree = calcObjectSizeTree(obj, name, { depth: 2 });
  console.log('sizeTree', sizeTree);
  return (
    <ol>
      {sizeTree.map((st) => (
        <Tree key={Math.random} tree={st} />
      ))}
    </ol>
  );
}

function Tree({ tree }) {
  console.warn('tree', tree);
  return (
    <li>
      {`${tree.name}: ${sizeFormatter(tree.size)}`}
      <Leafs leafs={tree.children} />
    </li>
  );
}

function Leafs({ leafs }) {
  return leafs?.length ? (
    <ol>
      {leafs.map((l) => (
        <Tree tree={l} />
      ))}
    </ol>
  ) : (
    <></>
  );
}

function calcObjectSizeTree(obj, name, { depth = 1, tooManyItems = 10 } = {}) {
  console.log('calcObjectSizeTree', ...arguments);
  const objSize = JSON.stringify(obj).length;
  const numKeys = Object.keys(obj).length;
  console.log('depth, name, objSize, numKeys', depth, name, objSize, numKeys);
  if (numKeys >= tooManyItems || depth <= 0) {
    return { name, size: objSize, children: [] };
  }

  const res = [];
  console.log('keys', Object.keys(obj));
  for (const key in obj) {
    const thisName = key;
    const thisSize = JSON.stringify(obj[thisName]).length;
    console.log('depth, thisName, thisSize', depth, thisName, thisSize);
    const children = Object.keys(obj[thisName])?.length
      ? calcObjectSizeTree(obj[thisName], thisName, { depth: depth - 1, tooManyItems })
      : [];
    res.push({ name: thisName, size: thisSize, children });
  }

  return res.sort(dynamicSort('-size'));
}

export function addStorageSection() {
  let results = [];
  for (const key in storage) {
    console.log(key, storage[key]);
    results.push({ key, size: JSON.stringify(storage[key]).length });
  }

  results.sort(dynamicSortMultiple('-size'));

  document.getElementById('mount-storage').innerHTML =
    '<ul class="storage">' +
    results
      .map((x) => {
        return `<li>${x.key}: ${sizeFormatter(x.size)}</li>`;
      })
      .join('') +
    `<li><b>TOTAL: ${sizeFormatter(JSON.stringify(storage).length)}</li>`;
  ('</ul>');
}

function sizeFormatter(bytes) {
  if (bytes >= 1000000) {
    return round(bytes / 1000000, 2) + ' MB';
  } else if (bytes >= 100000) {
    return round(bytes / 1000000, 2) + ' MB';
  } else {
    return round(bytes / 1000, 2) + ' kB';
  }
}
