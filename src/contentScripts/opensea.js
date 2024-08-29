import { startContentScriptPage } from '@lib/contentScriptLib.js';

//import { sleep } from '@ahstream/hx-lib';

// CONFIG

import '@styles/contentPages/default.scss';

const name = 'opensea';
const loglevel = 'debug';
const storageConfig = { keys: [], ensure: [] };
const statusbarConfig = { enabled: true };
const onLoadEvents = { load: true, DOMContentLoaded: true };

// AUTO STARTUP

let pagestate = {};

console.info(`${name}.js begin`, window?.location?.href);
startContentScriptPage({ loglevel, onLoaded, onLoadEvents, storageConfig, statusbarConfig });

async function onLoaded(loadedPagestate) {
  pagestate = { ...pagestate, ...loadedPagestate };
  console.info('Hx contentScript page loaded! Pagestate:', pagestate);
  initMessageHandler();
  runContentPage();
}

// CUSTOM STARTUP

const OPENSEA_HOME_URL = 'https://opensea.io';
const OPENSEA_DROPS_URL = 'https://opensea.io/drops';

function runContentPage() {
  console.info('runContentPage');

  pagestate.statusbar.button({ text: 'Alert', handler: () => window.alert('Alert') });

  if (pagestate.request?.cmd === 'startSampleTask') {
    return startSampleTask();
  }
  if (pagestate.request?.cmd === 'fetchDropsTask') {
    return fetchDropsTask();
  }
  if (window.location.href === OPENSEA_HOME_URL) {
    return runHomePage();
  }
  if (window.location.href === OPENSEA_DROPS_URL) {
    return runDropsPage();
  }

  pagestate.log?.debug('No match on contentPage, do nothing!');
}

// PAGE HANDLERS ---------------------------------------------------------------------

function runHomePage() {
  console.info('runHomePage');
}

function runDropsPage() {
  console.info('runDropsPage');
  pagestate.statusbar.button({ text: 'Fetch Drops', handler: fetchDrops });
}

// TASK HANDLERS ---------------------------------------------------------------------

function startSampleTask() {
  console.info('startSampleTask', pagestate.request);
  pagestate.statusbar.text('startSampleTask');
}

function fetchDropsTask() {
  console.info('fetchDropsTask', pagestate.request);
  pagestate.statusbar.text('fetchDropsTask');
  fetchDrops();
}

// ACTION HANDLERS ---------------------------------------------------------------------

function fetchDrops() {
  console.info('fetchDrops');
  pagestate.statusbar.text('fetchDrops');
}

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

function handleCommand1() {
  pagestate.log?.debug('handleCommand1');
}
