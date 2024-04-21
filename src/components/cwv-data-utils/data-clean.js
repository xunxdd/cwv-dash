const metricNames = [
  "cumulative_layout_shift",
  "interaction_to_next_paint",
  "largest_contentful_paint",
];

export function sanitizeCWVData({ data, cruxType = "origin", summaryOnly }) {
  if (!data) return [];
  const cwvData = [];
  data.forEach((item) => {
    const { metrics, collectionPeriods, key } = item.record;
    const totalCollectionPeriods = collectionPeriods.length - 1;
    const result = summaryOnly ? {} : { collectionPeriods, metrics };
    for (const name of metricNames) {
      try {
        const value =
          metrics[name].percentilesTimeseries.p75s[totalCollectionPeriods];
        result[name] = value == null ? "na" : Number(value);
      } catch {
        // console.error(`Error getting ${name} for ${key[cruxType]}`);
        result[name] = "na";
      }
    }
    const itmData = {
      URL: key[cruxType],
      lastCollectionPeriod: collectionPeriods[totalCollectionPeriods],
      ...result,
    };
    cwvData.push(itmData);
  });

  return cwvData;
}

export function getValidCruxData({ data, cruxType, summaryOnly = true }) {
  const records = [];

  data.forEach((itm) => {
    if (!itm.error && itm.record?.metrics) {
      const record = itm.record;
      const { key } = record;
      const keyName = cruxType;
      const exists = records.find(
        (r) => r.record && r.record.key[keyName] === key[keyName]
      );
      if (!exists) {
        records.push(itm);
      }
    }
  });

  return sanitizeCWVData({ data: records, cruxType, summaryOnly });
}
