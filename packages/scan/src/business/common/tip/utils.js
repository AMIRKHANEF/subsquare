const { findMetadata } = require("../../../specs");
const { getApi } = require("../../../api");
const {
  Modules,
  ProxyMethods,
  MultisigMethods,
  UtilityMethods,
  TipMethods,
} = require("../constants");
const { GenericCall } = require("@polkadot/types");
const { blake2AsHex } = require("@polkadot/util-crypto");
const {
  getConstFromRegistry,
  getConstsFromRegistry,
} = require("../../../utils/index");
const { currentChain, CHAINS } = require("../../../env");
const { expandMetadata } = require("@polkadot/types");

async function getTipMetaFromStorage(api, tipHash, { blockHeight, blockHash }) {
  const metadata = await findMetadata(blockHeight);
  const decorated = expandMetadata(metadata.registry, metadata);
  let key;
  if (decorated.query.treasury?.tips) {
    key = [decorated.query.treasury.tips, tipHash];
  } else {
    key = [decorated.query.tips.tips, tipHash];
  }

  const rawMeta = await api.rpc.state.getStorage(key, blockHash);
  return rawMeta.toJSON();
}

async function getTipReason(reasonHash, indexer) {
  const metadata = await findMetadata(indexer.blockHeight);
  const decorated = expandMetadata(metadata.registry, metadata);

  const api = await getApi();
  let key;
  if (decorated.query.treasury?.reasons) {
    key = [decorated.query.treasury.reasons, reasonHash];
  } else if (decorated.query.tips?.reasons) {
    key = [decorated.query.tips.reasons, reasonHash];
  } else {
    return null;
  }

  const raw = await api.rpc.state.getStorage(key, indexer.blockHash);
  return raw.toHuman();
}

function findNewTipCallFromProxy(registry, proxyCall, reasonHash) {
  const [, , innerCall] = proxyCall.args;
  return getNewTipCall(registry, innerCall, reasonHash);
}

function findNewTipCallFromMulti(registry, call, reasonHash) {
  const callHex = call.args[3];
  const innerCall = new GenericCall(registry, callHex);
  return getNewTipCall(registry, innerCall, reasonHash);
}

function findNewTipCallFromBatch(registry, call, reasonHash) {
  for (const innerCall of call.args[0]) {
    const call = getNewTipCall(registry, innerCall, reasonHash);
    if (call) {
      return call;
    }
  }

  return null;
}

function getNewTipCall(registry, call, reasonHash) {
  const { section, method, args } = call;
  if (Modules.Proxy === section && ProxyMethods.proxy === method) {
    return findNewTipCallFromProxy(registry, call, reasonHash);
  }

  if (Modules.Multisig === section || MultisigMethods.asMulti === method) {
    return findNewTipCallFromMulti(registry, call, reasonHash);
  }

  if (Modules.Utility === section && UtilityMethods.batch === method) {
    return findNewTipCallFromBatch(registry, call, reasonHash);
  }

  if (
    [Modules.Treasury, Modules.Tips].includes(section) &&
    [TipMethods.tipNew, TipMethods.reportAwesome].includes(method)
  ) {
    const hash = blake2AsHex(args[0]);
    if (hash === reasonHash) {
      return call;
    }
  }

  return null;
}

async function getTippersCountOfKarura(blockHash) {
  const api = await getApi();
  const members = await api.query.generalCouncil.members.at(blockHash);

  return members.length;
}

async function getTippersCount(registry, blockHash) {
  const chain = currentChain();
  if (CHAINS.KARURA === chain) {
    return await getTippersCountOfKarura(blockHash);
  }

  const oldModuleValue = getConstFromRegistry(
    registry,
    "ElectionsPhragmen",
    "DesiredMembers"
  );

  if (oldModuleValue) {
    return oldModuleValue.toNumber();
  }

  const newModuleValue = getConstFromRegistry(
    registry,
    "PhragmenElection",
    "DesiredMembers"
  );

  return newModuleValue ? newModuleValue.toNumber() : newModuleValue;
}

function getTipFindersFee(registry) {
  const constants = getConstsFromRegistry(registry, [
    {
      moduleName: "Tips",
      constantName: "TipFindersFee",
    },
    {
      moduleName: "Treasury",
      constantName: "TipFindersFee",
    },
  ]);

  return (constants[0] ?? constants[1])?.toJSON();
}

module.exports = {
  getNewTipCall,
  getTippersCount,
  getTipFindersFee,
  getTipMetaFromStorage,
  getTipReason,
};
