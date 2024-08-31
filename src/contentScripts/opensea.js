import { startContentScriptPage } from '@lib/contentScriptLib.js';

import { sleep, noDuplicates } from '@ahstream/hx-lib';
import {} from '@lib/lodashLib';
import { OPENSEA_HOME_URL, OPENSEA_DROPS_URL, getCollectionPage } from '@lib/openseaLib.js';

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
  console.info('HX contentScript page loaded! Pagestate:', pagestate);
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
  if (pagestate.request?.cmd === 'fetchDropsTask') {
    return fetchDropsTask();
  }

  if (window.location.href === OPENSEA_HOME_URL) {
    return runHomePage();
  }

  if (window.location.href === OPENSEA_HOME_URL) {
    return runHomePage();
  }

  if (window.location.href === OPENSEA_DROPS_URL) {
    return runDropsPage();
  }

  if (isCollectionPage()) {
    return runCollectionPage();
  }

  pagestate.log?.debug('No match on contentPage, do nothing!');
}

// PAGE HANDLERS ---------------------------------------------------------------------

function runHomePage() {
  pagestate.statusbar.text('runHomePage');
  console.info('runHomePage');
}

function runDropsPage() {
  console.info('runDropsPage');
  pagestate.statusbar.text('runDropsPage');
  pagestate.statusbar.button({ text: 'Fetch Drops', handler: fetchDrops });
}

function runCollectionPage() {
  console.info('runCollectionPage');
  pagestate.statusbar.text('runCollectionPage');
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

async function fetchDrops({ waitBetween = 3000 } = {}) {
  console.info('fetchDrops');
  pagestate.statusbar.text('fetchDrops');

  const links = await getDropLinks();
  console.log('links', links);

  const drops = [];
  for (const url of links.reverse()) {
    const drop = await getCollectionPage(url);
    console.log('drop', drop);
    drops.push(drop);
    await sleep(waitBetween);
  }

  console.log('drops', drops);
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

// HELPERS

async function getDropLinks({ waitBefore = 1000, waitBetween = 2000, scrollX = 0, scrollY = 800 } = {}) {
  console.info('getDropLinks');

  await sleep(waitBefore);
  let elemsAll = [];
  while (!isPageBottom()) {
    scrollBy(scrollX, scrollY);
    await sleep(waitBetween);
    const elemsRaw = Array.from(document.querySelectorAll('a[href$="/overview"]'));
    const elems = elemsRaw.map((x) => {
      return { url: x.href, data: x };
    });
    console.log(elems.length, elems);
    elemsAll = noDuplicates([...elemsAll, ...elems]);
    console.log('all', elemsAll.length, elemsAll);
  }
  scrollToHome();

  console.log('Done', elemsAll.length, elemsAll);
  return elemsAll.map((x) => x.url);
}

export function isPageBottom(delta = 10) {
  return window.innerHeight + Math.round(window.scrollY) + delta >= document.body.offsetHeight;
}

export function scrollBy(x = 0, y = 800) {
  window.scrollBy(x, y);
}

export function scrollToHome(x = 0, y = 0) {
  window.scrollTo(x, y);
}

export function isCollectionPage(url = window?.location?.href) {
  return url.match(/opensea.io\/collection\/[^\/]*\/overview/i);
}
