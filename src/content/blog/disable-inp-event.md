---
draft: false
title: "Can you disable a hyperlink to get out of the wrath of INP?"
snippet: "Can you disable your buttons or links or other interationable to avoid punishing INP"
image:
  {
    src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgrXUREYb7cYZoOKT7GbTB_z0KaYJPdeRGzC_lre5uRRiuW274GO1Obj36r6KjajzsrD6s7A60e6TksOs9GrUSY6z7401ev-aEdVw91evYZ6U8A0KmtVkBwNZvq_nBU7JkUyLt8aXneZbLQ4_br-JYKIW-MoIsx8MaVIvk_x1sFU8L-pCWreXhLm2xTs3Y/w1684-h1069-p-k-no-nu/inp.jpg",
    alt: "Hyperlink INP issue",
  }
publishDate: "2024-4-21 21:00"
category: "INP case study"
author: "x.d"
tags: [inp]
---

Debugging a webpage with INP issues is an excercise in bewilderment, a guessing game of what, where, how. A deep and often fruitless dive into the tangling mess of JavaScript script evalutions and executions.

When the tasks are heculean and numerious, you cannot but wondering if there is a short cut, a quick win of a sort, any sort?

INP events can happen after page load or during page load. It is those events during page load that often produce INPs with astronomical, horrific and embarassing scores.

So can I simply disable the interactions while a web page is busy?

For example, there is a page with a few table-of-contents sort of links that can cause some INP headaches. When I throttle CPU/network speed and while page is only half loaded, click on those links would show some pretty bad inp (input delay + presentation delay). Would disabling these links while page is loading / rendering / hydrating.help with INP?

![A bad inp event](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgrXUREYb7cYZoOKT7GbTB_z0KaYJPdeRGzC_lre5uRRiuW274GO1Obj36r6KjajzsrD6s7A60e6TksOs9GrUSY6z7401ev-aEdVw91evYZ6U8A0KmtVkBwNZvq_nBU7JkUyLt8aXneZbLQ4_br-JYKIW-MoIsx8MaVIvk_x1sFU8L-pCWreXhLm2xTs3Y/w1684-h1069-p-k-no-nu/inp.jpg)
The answer turned out to be a qualified NO.

Answer from a Guru ([Barry Pollard](https://twitter.com/tunetheweb?lang=en))

> Sometimes it’s best to think of INP as a measure I main thread blocking after clicking or typing. So it can be triggered by any interaction. So even if the links are inactive clicking on them will still potentially cause an “interaction”. And if your main thread is blocked then that will be measured until it frees up enough to paint. So first up I don’t think this will solve the issue for you.

> On the UX issue I’m not sure I agree disabling the links is good UX unless it’s obvious they are disabled. Imagine having a big button saying “PUSH ME” and it doesn’t do anything some of the time. Pretty frustrating right? Cause that’s what a link is basically. (edited)
