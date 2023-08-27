import useReferendumCurveData from "next-common/utils/hooks/referenda/detail/useReferendumCurveData";
import {
  useApprovalThresholdDatasetConfig,
  useSupportThresholdDatasetConfig,
} from "next-common/components/charts/thresholdCurve/utils/dataset";
import { useDetailPageOptionsWithoutTallyHistory } from "next-common/components/charts/thresholdCurve/utils/options";
import { Line } from "react-chartjs-2";
import hoverLinePlugin from "next-common/components/charts/plugins/hoverLine";
import React from "react";
import useInnerPoints from "next-common/components/charts/thresholdCurve/hooks/useInnerPoints";
import set from "lodash.set";
import { useFellowshipReferendumTally } from "next-common/hooks/fellowship/useFellowshipReferendumInfo";
import {
  useApprovalPercentage,
  useSupportPercentage,
} from "next-common/context/post/gov2/percentage";
import {
  useApprovalPercentageLine,
  useSupportPercentageLine,
} from "next-common/components/charts/thresholdCurve/annotations";
import useFellowshipPerbill from "next-common/utils/hooks/fellowship/useFellowshipPerbill";

export default function FellowshipCurveChart() {
  const tally = useFellowshipReferendumTally();
  const approvalPercentage = useApprovalPercentage(tally);
  const approvalThresholdLine = useApprovalPercentageLine(approvalPercentage);
  const supportPerbill = useFellowshipPerbill();
  const supportPercentage = useSupportPercentage(supportPerbill);
  const supportThresholdLine = useSupportPercentageLine(supportPercentage);

  const { labels, supportData, approvalData } = useReferendumCurveData();
  const supportThresholdConfig = useSupportThresholdDatasetConfig(supportData);
  const approvalThresholdConfig =
    useApprovalThresholdDatasetConfig(approvalData);

  const datasets = [supportThresholdConfig, approvalThresholdConfig];

  const chartData = { labels, datasets };
  const options = useDetailPageOptionsWithoutTallyHistory(labels, datasets);
  const { approvalInnerPoint, supportInnerPoint } = useInnerPoints(labels);
  set(
    options,
    "plugins.annotation.annotations.lineSupportThreshold",
    supportThresholdLine,
  );
  set(
    options,
    "plugins.annotation.annotations.lineApprovalThreshold",
    approvalThresholdLine,
  );
  set(
    options,
    "plugins.annotation.annotations.pointSupportInner",
    supportInnerPoint,
  );
  set(
    options,
    "plugins.annotation.annotations.pointApprovalInner",
    approvalInnerPoint,
  );

  return (
    <div style={{ height: 144 }}>
      <Line data={chartData} options={options} plugins={[hoverLinePlugin]} />
    </div>
  );
}
