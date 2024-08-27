console.log('serviceWorker begin');

import { defaultOptions, overrideOptions } from '../config/options.js';
import { initStorageWithOptions } from '@ahstream/hx-lib';

import { messageHandler } from '@lib/chromeMessageHandler.js';

import log from 'loglevel';
self.log = log;

console.info('options:', defaultOptions, overrideOptions);

const customStorage = {};

chrome.runtime.onInstalled.addListener(() => {
  initStorageWithOptions(defaultOptions, overrideOptions, customStorage);
  console.info('Extension successfully installed!');
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  log.info('Received message:', request, sender);

  const handled = messageHandler(request, sender);
  if (handled?.ok) {
    log.debug('Handled by common messageHandler:', request, sender, handled);
    if (handled.response !== undefined) {
      sendResponse(handled.response);
    }
    return;
  }

  log.debug('Handle by own messageHandler:', request, sender);
  await ownMessageHandler(request, sender, sendResponse);
});

// MAIN FUNCTIONS

// eslint-disable.next-line
async function ownMessageHandler(request, sender, sendResponse) {
  switch (request.cmd) {
    case 'echo':
      sendResponse(request.msg);
      return;
    default:
      break;
  }
  sendResponse();
}
