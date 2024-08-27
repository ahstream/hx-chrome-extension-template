/* eslint-disable */

// --------------------------------------------------------------
// SHORTCUTS FORMAT
//
// 1. Run command:
// chrome-extension://oodlifcpofmkpmicafoobehcmaegjkbe/shortcuts.html?cmd=minimize-window
//
// 2. Open url and run action in content_script:
// chrome-extension://oodlifcpofmkpmicafoobehcmaegjkbe/shortcuts.html?action=doSomething&url=https://example.org/
// --------------------------------------------------------------

import { getQueryParam, addPendingRequest } from '@ahstream/hx-lib';

// export const VALID_URLS = [/https:\/\/www\.alphabot\.app\/[a-z\-0-9]+/i, /https:\/\/www\.premint\.xyz\//i];
export const VALID_URLS = null;

export function getShortcuts(storage) {
  return [
    {
      cmd: 'close-tab',
      callback: () => {
        chrome.runtime.sendMessage({ cmd: 'closeMyTab' });
      },
    },
    {
      cmd: 'minimize-window',
      callback: () => {
        chrome.runtime.sendMessage({ cmd: 'minimizeWindow' });
      },
    },
    {
      cmd: 'storage-usage-example',
      callback: () => {
        window.alert(JSON.stringify(storage).length);
      },
    },
    {
      cmd: 'dispatch-example',
      callback: () => {
        return chrome.runtime.sendMessage({
          cmd: 'openInSameTab',
          url: chrome.runtime.getURL('/sandbox.html#action=dispatch'),
        });
      },
    },
    {
      cmd: 'add-pending-request-example',
      callback: async () => {
        const url = getQueryParam(window.location.href, 'url').trim();
        if (!url) {
          window.alert('ERROR: URL is empty');
          return;
        }
        await addPendingRequest(url, {
          action: 'something',
          data: 123,
        });
        window.location.href = url;
      },
    },
  ];
}
