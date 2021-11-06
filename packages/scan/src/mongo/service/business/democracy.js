const { getBusinessDemocracy } = require("../../business");

async function insertDemocracyPostByProposal(proposalIndex, indexer, proposer) {
  const col = await getBusinessDemocracy();
  const maybeInDb = await col.findOne({
    proposalIndex: proposalIndex,
  });
  if (maybeInDb) {
    return;
  }

  const now = new Date();
  await col.insertOne({
    proposalIndex,
    indexer,
    proposer,
    title: `Untitled - public proposal #${proposalIndex}`,
    content: "",
    contentType: "markdown",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });
}

async function updateOrCreatePostByReferendumWithProposal(
  proposalIndex,
  referendumIndex
) {
  const col = await getBusinessDemocracy();
  const maybeInDb = await col.findOne({
    proposalIndex: proposalIndex,
  });
  if (!maybeInDb) {
    const now = new Date();
    await col.insertOne({
      proposalIndex,
      referendumIndex,
      title: `Untitled - public proposal #${proposalIndex}`,
      content: "",
      contentType: "markdown",
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });

    return;
  }

  await col.updateOne(
    { proposalIndex },
    {
      $set: { referendumIndex },
    }
  );
}

async function insertDemocracyPostByExternal(
  externalProposalHash,
  indexer,
  proposer
) {
  const col = await getBusinessDemocracy();
  const maybeInDb = await col.findOne({
    externalProposalHash,
    "indexer.blockHeight": indexer.blockHeight,
  });
  if (maybeInDb) {
    return;
  }

  const now = new Date();
  await col.insertOne({
    externalProposalHash,
    indexer,
    proposer,
    title: `Untitled - external proposal ${externalProposalHash?.substr(0, 8)}`,
    content: "",
    contentType: "markdown",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });
}

async function updateDemocracyExternalPostWithReferendumIndex(
  externalProposalHash,
  height,
  referendumIndex
) {
  const col = await getBusinessDemocracy();

  const maybeInDb = await col.findOne({ referendumIndex });
  if (maybeInDb) {
    return;
  }

  await col.updateOne(
    {
      externalProposalHash,
      "indexer.blockHeight": height,
    },
    {
      $set: {
        referendumIndex,
      },
    }
  );
}

// Will executed when previous public or external proposal not detected
async function insertReferendumPostSolo(referendumIndex) {
  const col = await getBusinessDemocracy();
  const maybeInDb = await col.findOne({ referendumIndex });
  if (maybeInDb) {
    return;
  }

  await col.insertOne({ referendumIndex });
}

module.exports = {
  insertDemocracyPostByProposal,
  updateOrCreatePostByReferendumWithProposal,
  insertDemocracyPostByExternal,
  insertReferendumPostSolo,
  updateDemocracyExternalPostWithReferendumIndex,
};
