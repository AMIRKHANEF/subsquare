import Chains from "./consts/chains";

export function getMotionId(motion, chain) {
  if ([Chains.kusama, Chains.polkadot].includes(chain)) {
    return motion.motionIndex === undefined ? motion.index : motion.motionIndex;
  }

  return `${motion?.indexer?.blockHeight}_${motion?.hash}`;
}

export function getUniqueMotionId(motion) {
  return `${motion?.indexer?.blockHeight}_${motion?.hash}`;
}

export function shortMotionId(motion) {
  return motion.index ?? motion.hash.slice(0, 6);
}
