import { startContentScriptPage } from '@lib/contentScriptLib.js';

//import { sleep, noDuplicates } from '@ahstream/hx-lib';
import {} from '@lib/lodashLib';

// CONFIG

import '@styles/contentPages/default.scss';

const name = 'opensea';
const loglevel = 'debug';
const storageConfig = { keys: ['options'], ensure: [] };
const statusbarConfig = { enabled: true };
const onLoadEvents = { load: true, DOMContentLoaded: true };

// AUTO STARTUP

let pagestate = {};

console.info(`${name}.js begin`, window?.location?.href);
startContentScriptPage({ loglevel, onLoaded, onLoadEvents, storageConfig, statusbarConfig });

async function onLoaded(loadedPagestate) {
  if (window.hxDisabled) {
    return;
  }
  pagestate = { ...pagestate, ...loadedPagestate };
  console.info('Hx contentScript page loaded! Pagestate:', pagestate);
  initMessageHandler();
  runContentPage();
}

// CUSTOM STARTUP

function runContentPage() {
  console.info('runContentPage');

  pagestate.statusbar.button({ text: 'Alert', handler: () => window.alert('Alert') });

  if (pagestate.request?.cmd === 'startSampleTask') {
    return startSampleTask();
  }

  if (window.location.href === 'https://example.org/') {
    return runHomePage();
  }

  pagestate.log?.debug('No match on contentPage, do nothing!');
}

// PAGE HANDLERS ---------------------------------------------------------------------

function runHomePage() {
  pagestate.statusbar.text('runHomePage');
  console.info('runHomePage');
}

// TASK HANDLERS ---------------------------------------------------------------------

function startSampleTask() {
  console.info('startSampleTask', pagestate.request);
  pagestate.statusbar.text('startSampleTask');
}

function handleCommand1() {
  pagestate.log?.debug('handleCommand1');
  pagestate.statusbar.text('handleCommand1');
}

// ACTION HANDLERS ---------------------------------------------------------------------

// MESSAGE HANDLER ---------------------------------------------------------------------

async function initMessageHandler() {
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    pagestate.log?.debug('Received message:', request, sender);
    switch (request.cmd) {
      case undefined:
        // do nothing
        break;
      case 'command1':
        handleCommand1();
        break;
      case 'command2':
        pagestate.log?.debug('single line action');
        break;
      default:
        pagestate.log?.warn('Unexpected message:', request);
        break;
    }
    sendResponse();
    return true;
  });
}

// HELPERS
