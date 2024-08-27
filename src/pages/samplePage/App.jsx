import React from 'react';
import { useState, useEffect } from 'react';
import PageLayout from '@components/pageLayout/PageLayout.jsx';
import { loadStorage } from '@ahstream/hx-lib';
import './samplePage.scss';

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
        <PageLayout pageTitle="Sample Page">
          <p>Lorem ipsum</p>
          <p>Storage: {JSON.stringify(storage)}</p>
        </PageLayout>
      )}
    </>
  );
}
