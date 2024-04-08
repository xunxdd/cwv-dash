export function getValidCruxData(data) {
  return data.filter((itm) => !itm.error && itm.record?.metrics);
}
