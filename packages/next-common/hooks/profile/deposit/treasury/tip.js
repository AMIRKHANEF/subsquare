import useProfileAddress from "next-common/components/profile/useProfileAddress";
import useApi from "next-common/utils/hooks/useApi";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  useChainSettings,
  useMenuHasTreasuryTips,
} from "next-common/context/chain";
import { setProfileTipDeposits } from "next-common/store/reducers/profile/deposits/treasury";
import { queryAddressDeposits as queryAddressTipDeposits } from "next-common/hooks/account/deposit/useFetchMyTreasuryDeposits/useFetchMyTreasuryTipDeposits";

export default function useFetchProfileTreasuryTipDeposits() {
  const address = useProfileAddress();
  const api = useApi();
  const dispatch = useDispatch();
  const hasTreasuryTips = useMenuHasTreasuryTips();
  const { hasTipsModule } = useChainSettings();

  useEffect(() => {
    if (!hasTreasuryTips || !hasTipsModule) {
      dispatch(setProfileTipDeposits([]));
      return;
    }

    if (!api || !address || !api.query?.tips) {
      return;
    }

    queryAddressTipDeposits(api, address).then((data) => {
      dispatch(setProfileTipDeposits(data));
    });
  }, [api, address, dispatch, hasTipsModule]);
}
