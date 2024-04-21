---
draft: false
title: "INP optimization"
snippet: ""
image:
  {
    src: "https://web.dev/static/articles/inp/image/inp-desktop-v2.svg",
    alt: "interaction to next paint",
  }
publishDate: "2024-4-15 18:00"
category: "Resources"
author: "x.d"
tags: [inp]
---

The core web vital, INP (Interaction to Next Paint), measures a page's responsiveness to user interactions.

![Google INP Thresholds](https://web.dev/static/articles/inp/image/inp-desktop-v2.svg "Google INP Threshold")

[Introduction](https://web.dev/articles/inp)

- For most sites, the interaction with the worst latency is reported as INP
- An interaction could include pointerup, pointerdown, click, and tap on mobile devices

[What is an interaction](https://web.dev/articles/inp#whats_in_an_interaction)

- Mouse click, device tapping, keyboard interation.
- Rum data and CrUX data can be vastly different, because of the differeces in collection, sample, aggregation method. For example, RUM cannot track cwv events in iframes, while crux can and will

![The life of an INP](https://web.dev/static/articles/inp/image/a-diagram-depicting-inte-d2bec16a5952.svg "INP in action")

## How to optimize

### Guides from [Web.dev](https://web.dev)

[Optimize Interaction to Next Paint](https://web.dev/articles/optimize-inp)

- [Optimize input delay](https://web.dev/articles/optimize-input-delay)

  - Avoid recurring timers that kick off excessive main thread work

  - Avoid long task blocking main thread

  - Reduce long tasks during page load

- [Optimize processing time](https://web.dev/articles/optimize-input-delay)

  - Yield to allow rendering work to occur sooner
  - [Avoid large, complex layouts and layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing))

- Minimize presentation delay

  - Minimize DOM size

  - Use content-visibility to lazily render off-screen elements

  - [What forces layout/reflow. The comprehensive list](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)

### How to Guides From [debugbear](https://www.debugbear.com/)

![Example timeline of INP consisting of different CPU tasks](https://www.debugbear.com/dimg/b70d37b075161a11114679f5d5feee14.png "INP timeline")

- [Overview](https://www.debugbear.com/docs/metrics/interaction-to-next-paint)

  - INP processing time can be made up of multiple event handlers, for example keydown and keyup events

  - [How To Improve INP With Chrome DevTools](https://www.debugbear.com/blog/inp-chrome-devtools)

  - [Improving input delay during the initial page load process](https://www.debugbear.com/blog/inp-loading-stage)

  - [Avoid re-rendering](https://www.debugbear.com/blog/react-rerenders)

  - [Avoid re-layout](https://www.debugbear.com/blog/front-end-javascript-performance#avoid-dom-access-that-requires-layout-work)

## Video tutorials

[Optimize INP](https://youtu.be/xyk21_WKek8)

[Google's brief guide on How to optimize INP](https://www.youtube.com/watch?v=KZ1kxzsJZ5g&pp=ygUDSU5Q)

## INP measurement tools

- [Google search console](https://search.google.com/search-console/core-web-vitals/summary)
- [Debugbear INP debugger](https://www.debugbear.com/inp-debugger)
- [Speedcurve RUM](https://app.speedcurve.com/mediaos/fre/home/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- Chrome web dev tool - performance profile

Chrome web extension:

- [web vitals](https://chromewebstore.google.com/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)
