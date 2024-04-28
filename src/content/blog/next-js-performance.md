---
draft: false
title: "Next js has a performance issue "
snippet: "Next js sadly has a performance issue"
image:
  {
    src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7fINMHgsqaftXL6v7bZkW3Xc792jteJEtH2dwFF-EesHrm1NwBZvzrJlR_2PHr8SgU248UYhmlLnAu26NQPero6FOPKIbXoAmR5vTpmyHNY30JQiUZHr3PEw7ZODUj3wDGClLNN9xlbp88xjPFdKSbFnIET_5cOEr8anMBAfkUkvJ0Em6Ar_eDsx5f2U/s1600/Screenshot%202024-04-27%20at%205.18.26%20PM.png",
    alt: "Mext JS Performance issue",
  }
publishDate: "2024-4-27 22:00"
category: "INP issue"
author: "x.d"
tags: [inp, next js]
---

There is no shortage of data. Data and charts are abound

Sites powered by Next js are having web performance issues, as seen [Next js sites cwv chart](https://lookerstudio.google.com/reporting/55bc8fad-44c2-4280-aa0b-5f3f0cd3d2be/page/RNEOC?params=%7B%22df44%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580ALL%25EE%2580%2580OneTrust%25EE%2580%2580Complianz%25EE%2580%2580Axeptio%25EE%2580%2580PubTech%22,%22df48%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580Next.js%22%7D)

The question is why?

![CWV trend for sites running Next js](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7fINMHgsqaftXL6v7bZkW3Xc792jteJEtH2dwFF-EesHrm1NwBZvzrJlR_2PHr8SgU248UYhmlLnAu26NQPero6FOPKIbXoAmR5vTpmyHNY30JQiUZHr3PEw7ZODUj3wDGClLNN9xlbp88xjPFdKSbFnIET_5cOEr8anMBAfkUkvJ0Em6Ar_eDsx5f2U/s1600/Screenshot%202024-04-27%20at%205.18.26%20PM.png)

![Median lighthouse score and page weight](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhQNcw9cSSje6IopZFM62mSPIYh1IGE5laqzg79r8ekBULJ2l2rVt2-CF_fg-0h7-Pk300JyNyCPNTL3Kx7hEZ2V110RkCMLjQsZxpmWY_lr94ElbguRd4cK70VbMffSXM6MUYauQSpm1dGBePscZ4DGW_HeMQMfbPuEprW4Y5jMgRJOQoOaNeeZbeKZO8/s1600/Screenshot%202024-04-27%20at%205.18.52%20PM.png")

The dismal mobile performance of Next JS sites is detailed in this [article](https://calendar.perfplanet.com/2022/mobile-performance-of-next-js-sites/)

An old discussion [here](https://github.com/vercel/next.js/discussions/37341) largely pinned the blame on css-in-js. It points out the cost of rehydration of every dom node on the client and rests some hope on React 18 and react server components.
