export async function fetchCruxData(
  url,
  cruxType = "origin",
  formFactor = "PHONE"
) {
  const params = new URLSearchParams({ url, cruxType, formFactor });

  return fetch(`/api/crux-record.json?${params.toString()}`)
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return Promise.reject(data);
      }
      return data;
    })
    .then((response) => {
      if (response.error) {
        return Promise.reject(response);
      }
      return response;
    });
}
