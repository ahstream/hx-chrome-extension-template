/* eslint-disable */

const config = [
  { text: 'google', callback: () => window.open('https://www.google.com') },
  {
    text: 'samplePage.html',
    callback: () =>
      chrome.runtime.sendMessage({
        cmd: 'openTab',
        url: chrome.runtime.getURL('/samplePage.html'),
        active: true,
      }),
  },
  {
    text: 'options.html',
    callback: () =>
      chrome.runtime.sendMessage({
        cmd: 'openTab',
        url: chrome.runtime.getURL('/options.html'),
        active: true,
      }),
  },
  {
    text: 'openOptionsPage',
    callback: () =>
      chrome.runtime.sendMessage({
        cmd: 'openOptionsPage',
      }),
  },
  {
    text: 'Storage',
    callback: () =>
      chrome.runtime.sendMessage({
        cmd: 'openTab',
        url: chrome.runtime.getURL('/storage.html'),
        active: true,
      }),
  },
  {
    text: 'Sandbox',
    callback: () =>
      chrome.runtime.sendMessage({
        cmd: 'openTab',
        url: chrome.runtime.getURL('/sandbox.html'),
        active: true,
      }),
  },
  {
    text: 'Sandbox 2',
    callback: () =>
      chrome.runtime.sendMessage({
        cmd: 'openTab',
        url: chrome.runtime.getURL('/sandbox2.html'),
        active: true,
      }),
  },
  {
    text: 'TOC',
    callback: () =>
      chrome.runtime.sendMessage({
        cmd: 'openTab',
        url: chrome.runtime.getURL('/toc.html'),
        active: true,
      }),
  },
];

export default config;
