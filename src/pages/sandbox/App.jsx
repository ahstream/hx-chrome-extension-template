import React from 'react';
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import PageLayout from '@components/pageLayout/PageLayout.jsx';
import { loadStorage } from '@ahstream/hx-lib';
import './sandbox.scss';

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
        <PageLayout pageTitle="Sandbox">
          <p>React JavaScript sandbox for fast tooling, etc.</p>
          <div>
            <Button className="sandbox" onClick={run1}>
              Run 1
            </Button>
            <Button className="sandbox" onClick={clearResult}>
              Clear result
            </Button>
          </div>
          <br />
          <p>
            <b>Result:</b>
          </p>
          <textarea id="result" cols={80} rows={5} />
        </PageLayout>
      )}
    </>
  );
}

async function run1() {
  document.getElementById('result').value = 'run1 finished';
}

async function clearResult() {
  document.getElementById('result').value = '';
}
