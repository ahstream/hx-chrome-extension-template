import { fetchHelper, rateLimitHandler, parseReactProps } from '@ahstream/hx-lib';
import { toGenericDrop } from '@lib/dropLib.js';
import { mostFrequent, _sum } from '@lib/lodashLib';

// DATA ----------------------------------------------------------------------------------

export const OPENSEA_HOME_URL = 'https://opensea.io';
export const OPENSEA_DROPS_URL = 'https://opensea.io/drops';

// FUNCS -------------------------------------------------------------

export async function getCollectionPage(url, options = {}) {
  console.log('getCollectionPage', url, options);

  if (!url) {
    return { error: true };
  }

  const headers = {};
  const result = await fetchHelper(url, { method: 'GET', headers, ...options }, rateLimitHandler);
  console.log('result', result);

  if (result.error || !result.data) {
    return { error: true, result };
  }
  const pageProps = parseReactProps(result.data);
  console.log('pageProps', pageProps);

  const collectionData = pageProps?.props?.pageProps;
  if (!collectionData) {
    return { error: true, result, pageProps };
  }

  return toOpenseaDrop(collectionData, url);
}

function toOpenseaDrop(collectionData, url) {
  console.info('toOpenseaDrop', collectionData, url);

  const createPropItem = (key, value, type, parent) => {
    return { key, value, type, parent };
  };

  const base = collectionData;

  const obj = {};
  for (const propName1 in base.initialRecords) {
    const type = base.initialRecords[propName1]['__typename'];

    for (const propName2 in base.initialRecords[propName1]) {
      const item = createPropItem(propName2, base.initialRecords[propName1][propName2], type, propName1);
      obj[propName2] = obj[propName2] || [];
      //objAll[propName2] = objAll[propName2] || [];
      obj[propName2].push(item);
      //objAll[propName2].push(item);
    }
  }
  //const ref = Object.entries(o.pageProps.initialRecords['client:root']).find(x => x[1]['__ref'])[1]['__ref']

  const stageTypes = obj.stageType
    .map((v) => {
      return { stageName: v.value, type: v.type, parent: v.parent };
    })
    .filter((v) => v.stageName);
  const stageNames = stageTypes.map((v) => v.stageName);

  const drop = {
    url,
    connectedTwitterUsername: getProp(obj.connectedTwitterUsername, 'CollectionType'),
    connectedInstagramUsername: getProp(obj.connectedInstagramUsername, 'CollectionType'),
    createdDate: getProp(obj.createdDate, 'CollectionType'),
    description: getProp(obj.description, 'CollectionType'),
    discordUrl: getProp(obj.discordUrl, 'CollectionType'),
    externalUrl: getProp(obj.externalUrl, 'CollectionType'),
    id: getProp(obj.id, 'CollectionType'),
    imageUrl: getProp(obj.imageUrl, 'CollectionType'),
    instagramUrl: getProp(obj.instagramUrl, null),
    instagramUsername: getProp(obj.instagramUsername, 'CollectionType'),
    logo: getProp(obj.logo, 'CollectionType'),
    name: getProp(obj.name, 'CollectionType'),
    twitterUrl: getProp(obj.twitterUrl, null), // best
    twitterUsername: getProp(obj.twitterUsername, 'CollectionType'),
    websiteUrl: getProp(obj.websiteUrl, null),
    blockExplorerLink: getProp(obj.blockExplorerLink, null),
    // label: trimProp(obj.label),
    slug: getProp(obj.slug, 'CollectionType'),
    category: getProp(obj.slug, 'CategoryType'),
    chain: getProp(obj.identifier, 'ChainType'),
    totalItemCount: getHighProp(obj.totalItemCount, null), // SUPPLY!
    stageTypes,
    stageNames,

    // "DropStage721PresaleLinearPricingType", "DropStage721PublicLinearPricingType"
    startTime: getLowProp(obj.startTime, null),
    startTime1: getLowProp(obj.startTime, 'DropStage721PresaleLinearPricingType'),
    startTime2: getLowProp(obj.startTime, 'DropStage721PublicLinearPricingType'),
    startTimes: getProps(obj.startTime, null),
    startTimes1: getProps(obj.startTime, 'DropStage721PresaleLinearPricingType'),
    startTimes2: getProps(obj.startTime, 'DropStage721PublicLinearPricingType'),

    // "DropStage721PresaleLinearPricingType", "DropStage721PublicLinearPricingType"
    endTime: getLowProp(obj.endTime, null),
    endTime1: getLowProp(obj.endTime, 'DropStage721PresaleLinearPricingType'),
    endTime2: getLowProp(obj.endTime, 'DropStage721PublicLinearPricingType'),
    endTimes: getProps(obj.endTime, null),
    endTimes1: getProps(obj.endTime, 'DropStage721PresaleLinearPricingType'),
    endTimes2: getProps(obj.endTime, 'DropStage721PublicLinearPricingType'),

    // "DropStage721PresaleLinearPricingType", "DropStage721PublicLinearPricingType"
    availableMintsForUser: getAddedProps(obj.availableMintsForUser, null),
    availableMintsForUser1: getAddedProps(obj.availableMintsForUser, 'DropStage721PresaleLinearPricingType'),
    availableMintsForUser2: getAddedProps(obj.availableMintsForUser, 'DropStage721PublicLinearPricingType'),
    availableMintsForUsers: getProps(obj.availableMintsForUser, null),
    availableMintsForUsers1: getProps(obj.availableMintsForUser, 'DropStage721PresaleLinearPricingType'),
    availableMintsForUsers2: getProps(obj.availableMintsForUser, 'DropStage721PublicLinearPricingType'),

    eth: getProp(obj.eth, null),
    eths: getProps(obj.eth, null),
    eths9: getPropsWithStage(obj.eth, null, null, stageTypes),

    symbol: getProp(obj.symbol, 'PaymentAssetType'),
    symbolsPaymentType: getProps(obj.symbol, 'PaymentAssetType'),
    symbolsPriceType: getProps(obj.symbol, 'PriceType'),
    symbols9: getPropsWithStage(obj.symbol, 'PriceType', null, stageTypes),

    unit: getProps(obj.unit, null),
    units: getProps(obj.unit, null, ':priceType'),
    units9: getPropsWithStage(obj.unit, null, ':priceType', stageTypes),

    /*
      // // thumbnailUrl: trimProp(obj.thumbnailUrl),
      // title: trimProp(obj.title),
      totalQuantity: getHighProp(obj.totalQuantity, null),
      totalQuantites: getProps(obj.totalQuantity, null),
      totalSupply: getHighProp(obj.totalSupply, null),
      totalSupplies: getProps(obj.totalSupply, null),
      usds: getProps(obj.usd, null),
      */

    obj,
  };

  const stages = [];
  drop.startTimes.forEach((time, index) => {
    console.log(time, index);
    stages.push({
      stageName: drop.stageNames[index],
      startTime: time,
      endTime: drop.endTimes[index],
      availableMintsForUser: drop.availableMintsForUsers[index],
      price: drop.units9[index].value,
      currency: drop.symbols9[index].value,
    });
  });
  drop.stages = stages;

  return toGenericDrop(drop);
}

// HELPERS

function getProp(items, type, parentSuffix, err = undefined) {
  return !Array.isArray(items) ? err : mostFrequent(getTypedValues(items, type, parentSuffix));
}

function getProps(items, type, parentSuffix, err = undefined) {
  return !Array.isArray(items) ? err : getTypedValues(items, type, parentSuffix);
}

function getPropsWithStage(items, type, parentSuffix, stageTypes, err = undefined) {
  if (!Array.isArray(items)) {
    return err;
  }
  console.log('stageTypes', stageTypes);
  const objects = getTypedObjects(items, type, parentSuffix);
  console.log('objects', objects);

  const values = [];
  objects.map((o) => {
    console.log('x', o);
    const stage = stageTypes.find((s) => o.parent.includes(s.parent));
    // const stageName = stage?.length ? stage.stageName : null;
    console.log('stage', stage);
    values.push({ value: o.value, ...(stage ?? {}) });
  });

  console.log('values', values);
  return values;
}

function getAddedProps(items, type, parentSuffix, err = undefined) {
  return !Array.isArray(items) ? err : _sum(getTypedValues(items, type, parentSuffix).map((x) => Number(x)));
}

function getLowProp(items, type, parentSuffix, err = undefined) {
  if (!Array.isArray(items)) {
    return err;
  }
  const values = getTypedValues(items, type, parentSuffix).sort();
  return values[0] || err;
}

function getHighProp(items, type, parentSuffix, err = undefined) {
  if (!Array.isArray(items)) {
    return err;
  }
  const values = getTypedValues(items, type, parentSuffix).sort().reverse();
  return values[0] || err;
}

function getTypedValues(items, type, parentSuffix) {
  const filterItem = (item) => {
    return (!type || (type && item.type === type)) && (!parentSuffix || item.parent.endsWith(parentSuffix));
  };
  return items
    .filter((x) => filterItem(x))
    .map((x) => x.value)
    .filter((x) => x !== null);
}

function getTypedObjects(items, type, parentSuffix) {
  const filterItem = (item) => {
    return (!type || (type && item.type === type)) && (!parentSuffix || item.parent.endsWith(parentSuffix));
  };
  return items.filter((x) => filterItem(x)).filter((x) => x.value !== null);
}

// HELPERS --------------------------------------
