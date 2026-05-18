import allInpUrlData from "@assets/data/all-inp-urls.json";
import allPageUrlData from "@assets/data/all-page-urls.json";
import cadUrlData from "@assets/data/car-and-driver-urls.json";
import otherSiteData from "@assets/sample-data/other-sites.json";
import siteData from "@assets/data/sites.json";

const localCruxData = {
  origin: [...siteData, ...otherSiteData],
  url: [...allPageUrlData, ...allInpUrlData, ...cadUrlData],
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function normalizeCruxKey(value, cruxType) {
  try {
    const url = new URL(value);
    const normalizedUrl =
      cruxType === "origin" ? url.origin : `${url.origin}${url.pathname}`;
    return normalizedUrl.replace(/\/$/, "").toLowerCase();
  } catch {
    return String(value).replace(/\/$/, "").toLowerCase();
  }
}

function getLocalCruxData(url, cruxType) {
  const key = cruxType === "origin" ? "origin" : "url";
  const normalizedUrl = normalizeCruxKey(url, key);

  return localCruxData[key].find((item) => {
    const recordUrl = item.record?.key?.[key];
    return (
      item.record?.metrics &&
      normalizeCruxKey(recordUrl, key) === normalizedUrl
    );
  });
}

async function getLiveCruxData(url, cruxType) {
  const apiKey = import.meta.env.API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return null;
  }

  const key = cruxType === "origin" ? "origin" : "url";
  const apiEndpoint = `https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=${apiKey}`;
  const response = await fetch(apiEndpoint, {
    method: "POST",
    body: JSON.stringify({ [key]: url, formFactor: "PHONE" }),
  });
  const data = await response.json();

  if (!response.ok || data.error) {
    throw data;
  }

  return data;
}

export async function GET({ request }) {
  const requestUrl = new URL(request.url);
  const url = requestUrl.searchParams.get("url");
  const cruxType = requestUrl.searchParams.get("cruxType") || "origin";

  if (!url) {
    return jsonResponse({ error: "Missing url parameter" }, 400);
  }

  const localData = getLocalCruxData(url, cruxType);
  if (localData) {
    return jsonResponse(localData);
  }

  try {
    const liveData = await getLiveCruxData(url, cruxType);
    if (liveData) {
      return jsonResponse(liveData);
    }
  } catch (error) {
    return jsonResponse(
      { error: error?.error?.message || error?.message || "Error fetching data" },
      error?.error?.code || 502
    );
  }

  return jsonResponse({ error: `No CrUX data found for ${url}` }, 404);
}
