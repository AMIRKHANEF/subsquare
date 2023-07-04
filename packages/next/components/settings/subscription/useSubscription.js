import { useState } from "react";
import nextApi from "next-common/services/nextApi";
import { Options } from "next-common/components/setting/notification/styled";
import useAdvisoryCommitteeSubscription from "components/settings/subscription/useAdvisoryCommitteeSubscription";
import useOpenGovSubscription from "components/settings/subscription/useOpenGovSubscription";
import useTreasurySubscription from "components/settings/subscription/useTreasurySubscription";
import useDemocracySubscription from "components/settings/subscription/useDemocracySubscription";
import useCouncilSubscription from "components/settings/subscription/useCouncilSubscription";
import useTechCommSubscription from "components/settings/subscription/useTechCommSubscription";
import { useUser } from "next-common/context/user";

export default function useSubscription({ subscription: _subscription }) {
  const loginUser = useUser();
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState(_subscription);

  const isVerifiedUser = loginUser?.emailVerified;

  const { treasuryOptions, isTreasuryOptionsChanged, getTreasuryOptionValues } =
    useTreasurySubscription(subscription, saving, isVerifiedUser);

  const { councilOptions, isCouncilOptionsChanged, getCouncilOptionValues } =
    useCouncilSubscription(subscription, saving, isVerifiedUser);

  const { techCommOptions, isTechCommOptionsChanged, getTechCommOptionValues } =
    useTechCommSubscription(subscription, saving, isVerifiedUser);

  const {
    democracyOptions,
    isDemocracyOptionsChanged,
    getDemocracyOptionValues,
  } = useDemocracySubscription(subscription, saving, isVerifiedUser);

  const { openGovOptions, isOpenGovOptionsChanged, getOpenGovOptionValues } =
    useOpenGovSubscription(subscription, saving, isVerifiedUser);

  const {
    advisoryOptions,
    isAdvisoryCommitteeOptionsChanged,
    getAdvisoryCommitteeOptionValues,
  } = useAdvisoryCommitteeSubscription(subscription, saving, isVerifiedUser);

  const canSave =
    isVerifiedUser &&
    (isTreasuryOptionsChanged ||
      isCouncilOptionsChanged ||
      isTechCommOptionsChanged ||
      isDemocracyOptionsChanged ||
      isOpenGovOptionsChanged ||
      isAdvisoryCommitteeOptionsChanged);

  const fetchSubscriptionSetting = async () => {
    const { result } = await nextApi.fetch("user/subscription");
    if (result) {
      setSubscription(result);
    }
  };

  const updateSubscriptionSetting = async () => {
    setSaving(true);

    const data = {
      ...getTechCommOptionValues(),
      ...getCouncilOptionValues(),
      ...getDemocracyOptionValues(),
      ...getTreasuryOptionValues(),
      ...getOpenGovOptionValues(),
      ...getAdvisoryCommitteeOptionValues(),
    };

    const { result, error } = await nextApi.patch("user/subscription", data);
    if (result) {
      await fetchSubscriptionSetting();
    }

    setSaving(false);

    return { result, error };
  };

  const subscriptionComponent = (
    <Options>
      {openGovOptions}
      {treasuryOptions}
      {councilOptions}
      {techCommOptions}
      {advisoryOptions}
      {democracyOptions}
    </Options>
  );

  return {
    subscriptionComponent,
    updateSubscriptionSetting,
    isSubscriptionChanged: canSave,
  };
}