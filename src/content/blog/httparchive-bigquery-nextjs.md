---
draft: false
title: "Data check next js app router performance through HttpArchive big query"
snippet: ""
image:
  {
    src: "https://i.postimg.cc/7LxQMy4r/next-js-app-router-performance.png",
    alt: "Next js app router cwv",
  }
publishDate: "2024-07-05 21:00"
category: "INP "
author: "x.d"
tags: [inp]
---

INP has been around for a few years. INP, as an official metric, has replaced FID (First Input Delay) and used as one of the three core web vitals weleded by Google as a tie breaker in determining how search results are ranked and served to users.

Next JS has not been performing well in the competiion of core web vitals. The industry (whatever it means) seems to have to realize the terrible flaws of rendering a web page through server side first then subsequently "hydrating" them with the result JavaScript code. Whether it is in response to the poor showings in web performance metrics or the realization of inefficiency of the traditional next js, vercel, next js creator, introduced a new coding paradigm. They call it app router, as opposed the tradtional page router.

App router is complete break from the old next js page router. It is like Augular js 1.x to Augular 2.x. Same package, completely different content.

With that, all our code breaks too.

Humpty dumpty had a great fall.

...

I have been wondering how exactly next js app router been performing.

I eventually from the [data and charts](https://lookerstudio.google.com/u/0/reporting/55bc8fad-44c2-4280-aa0b-5f3f0cd3d2be/page/[…]580Next.js%25EE%2580%2580Next.js%2520App%2520Router%22%7D) in the very giant data pit http archive.

[![Next JS App router cwv performance](https://i.postimg.cc/7LxQMy4r/next-js-app-router-performance.png)](https://i.postimg.cc/7LxQMy4r)

Though i did not know, so i set out to learn about http archive and i learned how to query the CWV metrics for a technology I care.

The result is the following query:

```
CREATE TEMP FUNCTION IS_GOOD(good FLOAT64, needs_improvement FLOAT64, poor FLOAT64) RETURNS BOOL AS (
good / (good + needs_improvement + poor) >= 0.75
);

CREATE TEMP FUNCTION IS*NON_ZERO(good FLOAT64, needs_improvement FLOAT64, poor FLOAT64) RETURNS BOOL AS (
good + needs_improvement + poor > 0
);
SELECT *
FROM (
SELECT
date,
ARRAY_TO_STRING(ARRAY_AGG(DISTINCT category IGNORE NULLS ORDER BY category), ', ') AS categories,
app,
info,
REGEXP_EXTRACT( info, "(\\d.\\d)._" ) AS major_version,
client,
COUNT(DISTINCT url) AS origins,
COUNT(DISTINCT IF(good_inp, url, NULL)) AS origins_with_good_inp,
COUNT(DISTINCT IF(good_cls, url, NULL)) AS origins_with_good_cls,
COUNT(DISTINCT IF(good_lcp, url, NULL)) AS origins_with_good_lcp,
COUNT(DISTINCT IF(any_inp, url, NULL)) AS origins_with_any_inp,
COUNT(DISTINCT IF(any_cls, url, NULL)) AS origins_with_any_cls,
COUNT(DISTINCT IF(any_lcp, url, NULL)) AS origins_with_any_lcp,
COUNT(DISTINCT IF(good_cwv, url, NULL)) AS origins_with_good_cwv,
COUNT(DISTINCT IF(any_lcp AND any_cls, url, NULL)) AS origins_eligible_for_cwv,
SAFE_DIVIDE(COUNTIF(good_cwv), COUNTIF(any_lcp AND any_cls)) AS pct_eligible_origins_with_good_cwv
FROM (
SELECT
date,
CONCAT(origin, '/') AS url,
IF(device = 'desktop', 'desktop', 'mobile') AS client,
IS_NON_ZERO(fast_inp, avg_inp, slow_inp) AS any_inp,
IS_GOOD(fast_inp, avg_inp, slow_inp) AS good_inp,
IS_NON_ZERO(small_cls, medium_cls, large_cls) AS any_cls,
IS_GOOD(small_cls, medium_cls, large_cls) AS good_cls,
IS_NON_ZERO(fast_lcp, avg_lcp, slow_lcp) AS any_lcp,
IS_GOOD(fast_lcp, avg_lcp, slow_lcp) AS good_lcp,
(IS_GOOD(fast_inp, avg_inp, slow_inp) OR fast_inp IS NULL) AND
IS_GOOD(small_cls, medium_cls, large_cls) AND
IS_GOOD(fast_lcp, avg_lcp, slow_lcp) AS good_cwv
FROM
`chrome-ux-report.materialized.device_summary`
WHERE
date = '2024-05-01' AND
device IN ('phone')
) JOIN (
SELECT DISTINCT
CAST('2024-05-01' AS DATE) AS date,
category,
app,
info,
\_TABLE_SUFFIX AS client,
url
FROM
`httparchive.technologies.2024_05_01_\*`
WHERE
app = 'Next.js'
AND info != ''
) USING (date, url, client)
GROUP BY
date,
major_version,
app,
info,
client
) WHERE origins > 100
ORDER BY major_version DESC
```
