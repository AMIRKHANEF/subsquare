import Tooltip from "./tooltip";
import { abbreviateBigNumber, getEffectiveNumbers } from "../utils/viewfuncs";
import { cn } from "next-common/utils";

export default function ValueDisplay({
  value,
  symbol,
  showTooltip = true,
  className,
}) {
  const tooltipContent = `${value} ${symbol}`;
  const symbolContent = <span>{symbol}</span>;

  let content = (
    <>
      {Number(value)?.toLocaleString()}
      {symbolContent}
    </>
  );

  if (Number(value) >= 100000 || getEffectiveNumbers(value)?.length >= 11) {
    const abbreviated = abbreviateBigNumber(value, 2);
    content = (
      <>
        {getEffectiveNumbers(abbreviated) !== getEffectiveNumbers(value) && (
          <span>≈</span>
        )}
        {abbreviated}
        {symbolContent}
      </>
    );
  } else if (String(value).includes(".")) {
    const [int, decimal] = String(value).split(".");
    if (decimal?.length > 5) {
      const shortDecimal = decimal.substring(0, 5);
      content = (
        <>
          <span>≈</span>
          {int}.{shortDecimal}
          {symbolContent}
        </>
      );
    }
  }

  let container = (
    <span
      className={cn(
        "text14Medium",
        "inline-flex items-center gap-x-0.5",
        className,
      )}
    >
      {content}
    </span>
  );

  if (showTooltip) {
    container = <Tooltip content={tooltipContent}>{container}</Tooltip>;
  }

  return container;
}
