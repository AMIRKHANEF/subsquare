import React, { useMemo, useState } from "react";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

import useIsMounted from "next-common/utils/hooks/useIsMounted";
import { newErrorToast } from "next-common/store/reducers/toastSlice";
import { emptyFunction } from "next-common/utils";
import { sendTx, wrapWithProxy } from "next-common/utils/sendTx";
import SignerPopup from "next-common/components/signerPopup";
import RelatedReferenda from "../popupCommon/relatedReferenda";

export default function ClearExpiredDemocracyVotePopup({
  votes,
  onClose,
  onInBlock = emptyFunction,
}) {
  const dispatch = useDispatch();
  const isMounted = useIsMounted();
  const [isLoading, setIsLoading] = useState(false);

  const relatedReferenda = useMemo(() => {
    const referenda = [...new Set(votes)];
    referenda.sort((a, b) => a - b);
    return referenda;
  }, [votes]);

  const showErrorToast = useCallback(
    (message) => dispatch(newErrorToast(message)),
    [dispatch],
  );

  const doClearExpiredVote = useCallback(
    async (api, signerAccount) => {
      if (!api) {
        return showErrorToast("Chain network is not connected yet");
      }

      if (!signerAccount) {
        return showErrorToast("Please login first");
      }

      const signerAddress = signerAccount.address;
      const realAddress = signerAccount.proxyAddress || signerAddress;

      let tx;

      const txsRemoveVote = relatedReferenda.map((referendumIndex) =>
        api.tx.democracy.removeVote(referendumIndex),
      );
      const txUnlock = api.tx.democracy.unlock(realAddress);
      const allTx = [...txsRemoveVote, txUnlock];
      if (allTx.length > 1) {
        tx = api.tx.utility.batch([...txsRemoveVote, txUnlock]);
      } else {
        tx = allTx[0];
      }

      if (signerAccount?.proxyAddress) {
        tx = wrapWithProxy(api, tx, signerAccount.proxyAddress);
      }

      await sendTx({
        tx,
        setLoading: setIsLoading,
        dispatch,
        onInBlock,
        onClose,
        signerAddress,
        isMounted,
      });
    },
    [dispatch, isMounted, showErrorToast, onInBlock, onClose, relatedReferenda],
  );

  const title = relatedReferenda.length <= 0 ? "Unlock" : "Clear Expired Votes";
  return (
    <SignerPopup
      title={title}
      actionCallback={doClearExpiredVote}
      onClose={onClose}
      isLoading={isLoading}
      extraContent={<RelatedReferenda relatedReferenda={relatedReferenda} />}
    />
  );
}