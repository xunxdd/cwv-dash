const API_KEY = window.envs?.key;
const API_ENDPOINT = `https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=${API_KEY}`;

export async function fetchCruxData(url, cruxType = "origin") {
  if (!API_KEY) {
    return Promise.reject({ error: "API key not found" });
  }
  const key = cruxType === "origin" ? "origin" : "url";
  return fetch(API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ [key]: url, formFactor: "PHONE" }),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.error) {
        return Promise.reject(response);
      }
      return response;
    });
}
