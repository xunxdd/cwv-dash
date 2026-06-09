import { useEffect, useState } from "react";
import chartImage from "@assets/chart.webp";
import { getStatusColorClass } from "@components/crux/latest-period-summary";

const chartImageSrc =
  typeof chartImage === "string" ? chartImage : chartImage.src;

function formatDate(date) {
  if (!date) return "";

  const { year, month, day } = date;
  return `${month}/${day}/${year}`;
}

function formatPeriod(period) {
  const firstDate = formatDate(period?.firstDate);
  const lastDate = formatDate(period?.lastDate);

  if (!firstDate || !lastDate) return "unknown timeframe";
  return `${firstDate} to ${lastDate}`;
}

function formatCount(count) {
  return `${count} ${count === 1 ? "site" : "sites"}`;
}

function formatCategoryChange(current, previous) {
  if (current < previous) return `down from ${previous}`;
  if (current > previous) return `up from ${previous}`;
  return `unchanged from ${previous}`;
}

function formatList(items) {
  if (!items.length) return "none";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function formatImprovedSites(sites) {
  if (!sites.length) return "No improved sites.";

  return `Improved sites include ${formatList(
    sites.map(
      ({ siteName, improvement }) =>
        `${siteName} (improved by ${improvement.toFixed(2)})`
    )
  )}.`;
}

function StatusCount({ count, status }) {
  return (
    <span className={`font-semibold ${getStatusColorClass(status)}`}>
      {formatCount(count)}
    </span>
  );
}

function getUnavailableText({ count, sites }) {
  if (!count) return "";

  return ` ${formatCount(
    count
  )} did not have a comparable latest-period delta (${formatList(sites)}).`;
}

function getDeviceSummaryText({ label, summary, latestDate }) {
  if (!summary) return null;

  const needsImprovementCount = summary.currentCounts.needsImprovement;
  const previousNeedsImprovementCount =
    summary.previousCounts.needsImprovement;
  const needsImprovementChange = formatCategoryChange(
    needsImprovementCount,
    previousNeedsImprovementCount
  );
  const poorCount = summary.currentCounts.poor;
  const poorSites = formatList(summary.poorSites);

  return (
    <>
      For {label}, {formatCount(summary.improvedCount)} improved,{" "}
      {formatCount(summary.worseCount)} got worse, and{" "}
      {formatCount(summary.flatCount)} remained flat.
      {getUnavailableText({
        count: summary.unavailableCount,
        sites: summary.unavailableSites,
      })}{" "}
      As of {latestDate}, we have{" "}
      <StatusCount
        count={needsImprovementCount}
        status="needsImprovement"
      />{" "}
      in the "Needs Improvement" category ({needsImprovementChange} in the
      previous period) and <StatusCount count={poorCount} status="poor" /> in
      the "Poor" category ({poorSites}).{" "}
      {formatImprovedSites(summary.topImprovedSites)}
    </>
  );
}

function DeviceParagraph({ label, summary, latestDate }) {
  if (!summary) return null;

  return (
    <p className="mt-4">
      {getDeviceSummaryText({ label, summary, latestDate })}
    </p>
  );
}

function DirectionStats({ label, summary }) {
  if (!summary) return null;

  return (
    <div className="text-xs text-gray-700">
      <span className="font-semibold text-gray-900">{label}</span>{" "}
      <span className="text-green-700">{summary.improvedCount} improved</span>
      <span className="text-gray-400"> / </span>
      <span className="text-red-700">{summary.worseCount} worse</span>
      <span className="text-gray-400"> / </span>
      <span>{summary.flatCount} flat</span>
      {summary.unavailableCount > 0 && (
        <>
          <span className="text-gray-400"> / </span>
          <span>{summary.unavailableCount} n/a</span>
        </>
      )}
    </div>
  );
}

function StatusStats({ label, summary }) {
  if (!summary) return null;

  return (
    <div className="text-xs text-gray-700">
      <span className="font-semibold text-gray-900">{label} CLS</span>{" "}
      <span className={getStatusColorClass("good")}>
        {summary.currentCounts.good} good
      </span>
      <span className="text-gray-400"> / </span>
      <span className={getStatusColorClass("needsImprovement")}>
        {summary.currentCounts.needsImprovement} needs improvement
      </span>
      <span className="text-gray-400"> / </span>
      <span className={getStatusColorClass("poor")}>
        {summary.currentCounts.poor} poor
      </span>
      {summary.currentCounts.na > 0 && (
        <>
          <span className="text-gray-400"> / </span>
          <span className={getStatusColorClass("na")}>
            {summary.currentCounts.na} n/a
          </span>
        </>
      )}
    </div>
  );
}

export default function ExecutiveSummary({ summary }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!summary) return null;

  const timeframe = formatPeriod(summary.latestPeriod);
  const latestDate = formatDate(summary.latestPeriod?.lastDate);
  const intro = `Report on the CLS trend for the latest CrUX collection period (${timeframe}) across the ${formatCount(
    summary.totalSites
  )} I have been tracking.`;

  return (
    <>
      <section className="mb-4 flex flex-col gap-3 border border-gray-200 bg-white p-3 text-sm text-gray-800 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={chartImageSrc}
            alt="Core Web Vitals chart"
            className="h-14 w-14 flex-none object-cover"
            loading="eager"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">
              CLS Executive Summary
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              {timeframe} across {formatCount(summary.totalSites)}
            </p>
            <div className="mt-2 flex flex-col gap-1 md:flex-row md:gap-3">
              <DirectionStats label="Mobile" summary={summary.devices.mobile} />
              <DirectionStats
                label="Desktop"
                summary={summary.devices.desktop}
              />
            </div>
            <div className="mt-1 flex flex-col gap-1 md:flex-row md:gap-3">
              <StatusStats label="Mobile" summary={summary.devices.mobile} />
              <StatusStats
                label="Desktop"
                summary={summary.devices.desktop}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          className="self-start border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:border-gray-500 hover:text-gray-950 md:self-center"
          onClick={() => setIsOpen(true)}>
          View report
        </button>
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="executive-summary-title"
          onClick={() => setIsOpen(false)}>
          <section
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto bg-white p-5 text-sm leading-6 text-gray-800 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={chartImageSrc}
                  alt="Core Web Vitals chart"
                  className="h-16 w-16 flex-none object-cover"
                  loading="eager"
                />
                <div>
                  <h2
                    id="executive-summary-title"
                    className="text-base font-semibold text-gray-900">
                    Executive Summary
                  </h2>
                  <p className="mt-1 text-xs text-gray-600">{timeframe}</p>
                </div>
              </div>
              <button
                type="button"
                className="border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:border-gray-500 hover:text-gray-950"
                aria-label="Close executive summary"
                onClick={() => setIsOpen(false)}>
                x
              </button>
            </div>
            <p className="mt-4">{intro}</p>
            <DeviceParagraph
              label="mobile"
              summary={summary.devices.mobile}
              latestDate={latestDate}
            />
            <DeviceParagraph
              label="desktop"
              summary={summary.devices.desktop}
              latestDate={latestDate}
            />
          </section>
        </div>
      )}
    </>
  );
}
