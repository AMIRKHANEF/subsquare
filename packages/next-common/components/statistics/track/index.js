import React from "react";
import DemocracyStatistics from "../democracy";
import TurnoutStatistics from "./turnoutStatistics";
import AllVotesStatistics from "./allVoteStatistics";

export default function TrackStatistics({
  track,
  turnout,
  delegatee,
  delegators,
  summary,
}) {
  return (
    <>
      <AllVotesStatistics turnout={turnout} />
      <DemocracyStatistics
        apiRoot={`statistics/referenda/tracks/${track.id}`}
        delegatee={delegatee}
        delegators={delegators}
        summary={summary}
      />
      <TurnoutStatistics turnout={turnout} />
    </>
  );
}