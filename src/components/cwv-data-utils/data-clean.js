export function getValidCruxData(data, byUrl = true) {
  const records = [];

  data.forEach((itm) => {
    if (!itm.error && itm.record?.metrics) {
      const record = itm.record;
      const { key } = record;
      const keyName = byUrl ? "url" : "origin";
      const exists = records.find(
        (r) => r.record && r.record.key[keyName] === key[keyName]
      );
      if (!exists) {
        records.push(itm);
      }
    }
  });

  return records;
}
