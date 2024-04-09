const API_KEY = window.envs?.key;
const API_ENDPOINT = `https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=${API_KEY}`;

export async function fetchCruxData(url) {
  if (!API_KEY) {
    return Promise.reject({ error: "API key not found" });
  }
  return fetch(API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ url, formFactor: "PHONE" }),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.error) {
        return Promise.reject(response);
      }
      return response;
    });
}
