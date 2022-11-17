import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import BigNumber from "bignumber.js";

import useApi from "../../../../utils/hooks/useApi";
import useIsMounted from "../../../../utils/hooks/useIsMounted";
import { newErrorToast } from "../../../../store/reducers/toastSlice";

import { checkInputValue, emptyFunction } from "../../../../utils";
import PopupWithAddress from "../../../popupWithAddress";
import ProposalBond from "./proposalBond";
import Beneficiary from "../../common/beneficiary";
import ProposalValue from "./proposalValue";
import Signer from "./signer";
import useAddressBalance from "../../../../utils/hooks/useAddressBalance";
import { WarningMessage } from "../../../popup/styled";
import useBond from "../../../../utils/hooks/useBond";
import { sendTx } from "../../../../utils/sendTx";
import SecondaryButton from "../../../buttons/secondaryButton";
import { useChainSettings } from "../../../../context/chain";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

function PopupContent({
  extensionAccounts,
  onClose,
  onInBlock = emptyFunction,
  onFinalized = emptyFunction,
  onSubmitted = emptyFunction,
}) {
  const dispatch = useDispatch();
  const isMounted = useIsMounted();
  const [signerAccount, setSignerAccount] = useState(null);
  const [inputValue, setInputValue] = useState();
  const [loading, setLoading] = useState(false);

  const node = useChainSettings();
  const api = useApi();

  const proposalValue = new BigNumber(inputValue).times(
    Math.pow(10, node.decimals)
  );
  const bond = useBond({
    api,
    proposalValue,
  });

  const [beneficiary, setBeneficiary] = useState();

  const [balance, balanceIsLoading] = useAddressBalance(
    api,
    signerAccount?.address
  );

  const showErrorToast = (message) => dispatch(newErrorToast(message));

  const submit = async () => {
    if (!api) {
      return showErrorToast("Chain network is not connected yet");
    }

    if (!signerAccount) {
      return showErrorToast("Please select an account");
    }

    if (!beneficiary) {
      return showErrorToast("Please input a beneficiary");
    }

    let bnValue;
    try {
      bnValue = checkInputValue(inputValue, node.decimals);
    } catch (err) {
      return showErrorToast(err.message);
    }

    const tx = api.tx.treasury.proposeSpend(bnValue.toNumber(), beneficiary);

    const signerAddress = signerAccount.address;

    await sendTx({
      tx,
      dispatch,
      setLoading,
      onFinalized,
      onInBlock: (eventData) => {
        const [proposalIndex] = eventData;
        onInBlock(signerAddress, proposalIndex);
      },
      onSubmitted,
      onClose,
      signerAddress,
      isMounted,
      section: "treasury",
      method: "Proposed",
    });
  };

  const balanceInsufficient = new BigNumber(bond).gt(balance);
  const disabled = balanceInsufficient || !new BigNumber(inputValue).gt(0);

  return (
    <>
      <Signer
        api={api}
        signerAccount={signerAccount}
        setSignerAccount={setSignerAccount}
        extensionAccounts={extensionAccounts}
        node={node}
        balance={balance}
        balanceIsLoading={balanceIsLoading}
      />
      <Beneficiary
        extensionAccounts={extensionAccounts}
        setAddress={setBeneficiary}
      />
      <ProposalValue setValue={setInputValue} />
      <ProposalBond bond={bond} node={node} />
      {balanceInsufficient && (
        <WarningMessage danger>Insufficient balance</WarningMessage>
      )}
      <ButtonWrapper>
        <SecondaryButton
          disabled={disabled}
          isLoading={loading}
          onClick={submit}
        >
          Submit
        </SecondaryButton>
      </ButtonWrapper>
    </>
  );
}

export default function Popup(props) {
  return (
    <PopupWithAddress
      title="New Treasury Proposal"
      Component={PopupContent}
      {...props}
    />
  );
}
