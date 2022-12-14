import React from "react";
import styled from "styled-components";
import useApi from "next-common/utils/hooks/useApi";
import DemocracySummaryStackInfo from "./democracySummaryStackInfo";
import DemocracySummaryStackButton from "./democracySummaryStackButton";
import useRealAddress from "next-common/utils/hooks/useRealAddress";
import { useLatestAddressVotingBalance, useLockedBalance } from "utils/hooks";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

export default function KintsugiDemocracyStacking() {
  const api = useApi();
  const realAddress = useRealAddress();
  const [votingBalance] = useLatestAddressVotingBalance(api, realAddress);
  const [balance] = useLockedBalance(api, realAddress);

  return (
    <Wrapper>
      <DemocracySummaryStackInfo
        votingBalance={votingBalance}
        balance={balance}
      />
      <DemocracySummaryStackButton />
    </Wrapper>
  );
}
