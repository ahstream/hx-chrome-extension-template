export function messageHandler(request, sender) {
  switch (request.cmd) {
    // -------------------------------------
    // OPEN TAB
    // -------------------------------------

    case 'openTab':
      openTab(request.url, request.active);
      break;

    case 'openInSameTab':
      openInSameTab(request.url);
      break;

    case 'openInSameishTab':
      openInSameTypeTab(request.url, sender?.tab?.url, 'http');
      break;

    case 'openFocusedTab':
      openTab(request.url, true);
      break;

    // -------------------------------------
    // CLOSE TAB
    // -------------------------------------

    case 'closeTab':
      closeTab(request.tabId);
      break;

    case 'closeMyTab':
      closeTab(sender?.tab?.id);
      break;

    case 'closeTabs':
      closeTabs(request.tabIds);
      break;

    // -------------------------------------
    // SEND
    // -------------------------------------

    case 'sendTo':
      chrome.tabs.sendMessage(Number(request.to), { ...request.request });
      break;

    case 'broadcast':
      chrome.tabs.query({}, (tabs) =>
        tabs.forEach((tab) => {
          //console.log('tab', tab);
          chrome.tabs.sendMessage(tab.id, { ...request.request });
        })
      );
      break;

    // -------------------------------------
    // FOCUS
    // -------------------------------------

    case 'focusTab':
      focusTab(request.id);
      break;

    case 'focusMyTab':
      focusTab(sender?.tab?.id);
      break;

    case 'unfocusTab':
      unfocusTab(request.id);
      break;

    case 'unfocusMyTab':
      unfocusTab(sender?.tab?.id);
      break;

    // -------------------------------------
    // WINDOW
    // -------------------------------------

    case 'closeWindow':
      closeWindow();
      break;

    case 'minimize':
      minimizeWindow();
      break;

    case 'minimizeWindow':
      minimizeWindow();
      break;

    // -------------------------------------
    // OTHER
    // -------------------------------------

    case 'getMyTabId':
      return { ok: true, response: sender.tab.id };

    case 'openOptionsPage':
      openOptionsPage();
      break;

    // -------------------------------------
    // CLOSE OTHER TABS
    // -------------------------------------

    case 'closeOtherTabs':
      closeOtherTabs(sender);
      break;
    case 'closeOtherNormalTabs':
      closeOtherNormalTabs(sender);
      break;
    case 'closeMyOpenedTabs':
      closeMyOpenedTabs(sender.tab.id);
      break;
    case 'closeNewerNormalTabs':
      closeNewerNormalTabs(sender);
      break;
    case 'closeTabsButOne':
      closeTabsButOne(sender.tab.id, request.url);
      break;
    case 'closeTabsButOneMinimizeWindow':
      closeTabsButOneMinimizeWindow(sender.tab.id, request.url);
      break;

    default:
      //console.log('Not hit in this messageHandler!');
      return false;
  }

  // If getting here, we have handled it!
  return { ok: true };
}

// WORKER FUNCS -------------------------------------------------------------------

function openInSameTypeTab(url, senderUrl, sameTabUrlStartsWith) {
  //console.log('sender.tab', sender.tab);
  if (senderUrl.startsWith(sameTabUrlStartsWith)) {
    chrome.tabs.update(undefined, { url });
  } else {
    chrome.tabs.create({ url });
  }
}

async function closeTab(tabId) {
  try {
    const tabIdVal = ensureTabId(tabId);
    if (!(await tabExists(tabIdVal))) {
      //console.log('Skip already closed tab:', tabId);
      return false;
    }
    const tab = await chrome.tabs.get(tabIdVal);
    if (tab) {
      //console.log('remove tab...', tab);
      chrome.tabs.remove(tabIdVal, () => console.log('Close tab: ', tabIdVal));
      return true;
    } else {
      //console.log(`skip close tab ${tabId}`);
      return false;
    }
  } catch (e) {
    console.error('removeTab error:', tabId, e.message);
    return false;
  }
}

async function closeTabs(tabIds) {
  for (const tabId of tabIds) {
    closeTab(tabId);
  }
}

function focusTab(tabId) {
  chrome.tabs.update(ensureTabId(tabId), { highlighted: true });
}

function unfocusTab(tabId) {
  chrome.tabs.update(ensureTabId(tabId), { highlighted: false, active: false });
}

// EXTERNAL LIB

export function openTab(url, active) {
  chrome.tabs.create({ url, active: active ?? false });
}

export function openInSameTab(url) {
  chrome.tabs.update(undefined, { url });
}

export function closeWindow() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.remove(tab.id, () => console.log(`Close tab:`, tab));
    });
  });
  return true;
}

export function minimizeWindow() {
  chrome.windows.getCurrent((win) => {
    //console.log(win);
    chrome.windows.update(win.id, { state: 'minimized' });
  });
}

export function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

export async function getTabsToRight(sender) {
  //console.log('getTabsToRight');
  chrome.tabs.query({}, (tabs) => {
    //console.log('tabs:', tabs);
    const tabsResult = [];
    for (let tab of tabs) {
      if (tab.index > sender.tab.index) {
        //console.log('tab is RIGHT:', tab);
        tabsResult.push(tab);
      } else {
        //console.log('tab is left:', tab);
      }
    }
    //console.log('tabsResult:', tabsResult);
    return tabsResult;
  });
}

export async function tabExists(tabId) {
  try {
    await chrome.tabs.get(tabId);
    return true;
  } catch (e) {
    return false;
  }
}

// HELPERS

function ensureTabId(v) {
  return Number(v);
}

function closeOtherTabs(sender) {
  closeOtherTabsGeneric(sender.tab, false, false);
}

function closeOtherNormalTabs(sender) {
  closeOtherTabsGeneric(sender.tab, false, true);
}

function closeNewerNormalTabs(sender) {
  closeOtherTabsGeneric(sender.tab, true, true);
}

function closeOtherTabsGeneric(myTab, onlyNewer = false, onlyNormal = true, exceptionTabIds = []) {
  //console.log('closeOtherTabs; myTab, onlyNewer, onlyNormal, exceptionTabIds', myTab, onlyNewer, onlyNormal, exceptionTabIds);
  chrome.tabs.query({}, (tabs) => {
    //console.log('tabs', tabs);
    tabs.forEach((tab) => {
      //console.log('tab', tab);
      let shouldClose = false;
      if (onlyNewer) {
        shouldClose = tab.id > myTab.id && (onlyNormal ? tab.url.startsWith('http') : true);
      } else {
        shouldClose = tab.id !== myTab.id && (onlyNormal ? tab.url.startsWith('http') : true);
      }
      if (exceptionTabIds.includes(tab.id)) {
        shouldClose = false;
      }
      //console.log('shouldClose:', shouldClose);
      if (shouldClose) {
        //console.log('Close this tab:', tab);
        chrome.tabs.remove(tab.id, () => console.log('Close tab: ', tab));
      }
    });
  });
}

function closeMyOpenedTabs(myTabId) {
  //console.log('closeMyOpenedTabs; myTabId:', myTabId);
  chrome.tabs.query({}, (tabs) => {
    //console.log('closeMyOpenedTabs tabs', tabs);
    tabs.forEach((tab) => {
      //console.log('tab', tab);
      const shouldClose = tab.openerTabId && tab.openerTabId === myTabId;
      //console.log('shouldClose:', shouldClose);
      if (shouldClose) {
        //console.log('Close this tab:', tab);
        if (tab) {
          chrome.tabs.remove(tab.id, () => console.log('Close tab:', tab));
        }
      }
    });
  });
}

function closeTabsButOne(senderTabId, url) {
  const butOneTabUrl = url || 'chrome://version/';
  chrome.tabs.update(senderTabId, { url: butOneTabUrl });
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      //console.log('tab', tab);
      if (senderTabId === tab.id) {
        return;
      }
      chrome.tabs.remove(tab.id, () => console.log(`Close tab:`, tab));
    });
  });
  return true;
}

function closeTabsButOneMinimizeWindow(senderTabId, url) {
  closeTabsButOne(senderTabId, url);
  minimizeWindow();
  return true;
}
