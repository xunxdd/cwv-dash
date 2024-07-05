---
draft: false
title: "INP and FID, night and day. Why?"
snippet: ""
image:
  {
    src: "https://i.postimg.cc/rFNzLLQ2/inp-vs-fid.png",
    alt: "INP and FID, night and day. Why",
  }
publishDate: "2024-7-2 21:00"
category: "INP Case Study"
author: "x.d"
tags: [inp]
---

I posted a question to the performance gurus in the wildly popular Webperformance slack space.

> If a website has terrific FID yet horrific INP, what could it mean? I understand that FID and INP are different metrics: one measures the delay of the first user interaction, while the other measures the delay of overall user interactions and reports the worst of them. Still, I would not expect the difference to be so extreme, as if they are as different as night and day and share nothing in common.
>
> Web page tests and various performance data point to long input delays, heavy main thread blocking, and JavaScript execution—common culprits. Still, my question is: how on earth can FID be so fast if there is so much input delay? The site in question is also quite static in nature.
>
> I also asked the forever more knowledgable AI. The following is the answer:
>
> Heavy JavaScript Execution: Even on mostly static pages, if there are complex scripts running after the initial load, these can delay processing of user inputs that trigger visual changes. The initial interaction might not be affected if it occurs before these scripts execute, resulting in a good FID. However, INP would capture delays from interactions that happen while these scripts are executing. And blah ...
>
> Here is a case in point:
> <img src="https://i.postimg.cc/rFNzLLQ2/inp-vs-fid.png" alt= "INP and FID, night and day. Why">

If everyone has the confidence of AI, everyone on the planet earth will be an insufferable asshole.

I got some replies from the Webperformance channel:

Answer1: It means NOTHING.

> FID has never ever been useful or valuable and as such isn’t worthy of comparison with INP. They’re different and INP is showing you a genuine delay in user interactions

Yes, true. FID has never been presented as a serious worthy metric. Still what makes them so different?

Google guru pressed more data, so I offered the following data

> From the Speedcurve data we have right now, one thing is clear, most of our INP time is input delay.
> For example, for yesterday June 28th, for this one particular web page, we have 43 sessions from android users.
> Key 75 percentile metrics are:
> Page Load: 9.76s, INP start: 7.79s, INP delay: 655 ms.
> Some of the elements with horrendous inp are part of the headers and not really clickable.

![sample attrition data](https://i.postimg.cc/k7fbsmq1/inp-stats.jpg)

![key life cycle states](https://i.postimg.cc/JnwnsKJg/key-stats.jpg)

![sample-inp-elements.jpg](https://i.postimg.cc/cHHS4nkj/sample-inp-elements.jpg)

With that, I got a very detailed expert explanation pertaining to the difference of the 2 metrics

> I would say this all adds up: FCP + LCP is happening way before Page Load.
>
> So your site is probably using server side rendering for first pagehit.
>
> This means the page was visible way before JS/hydration was done.
>
> But this also means that the average visitor perceives the page as ready to interact with. Actually, they obviously don't actively think that. They just see a > hamburger menu and start to click. Maybe at around second 3 or 4 (anywhere before app-started, which might happen relatively late due to your audience's conditions > as downloading React files takes a while).
>
> The hamburger menu obviously isn't doing anything at the 3 or 4 second mark, because hydration didn't even start yet. Third parties likely aren't doenloaded nor executed either.
>
> So, technically speaking, the first interaction result in no particular delay.
>
> Sure, nothing happened due to lack of interactive JS at this time in moment. But that is not what FID is about. So FID comes out as being very healthy.
>
> But your non technical visitors (probably 99% of them) are first waiting for sonething to happen, only to realize nothing is going to happen anymore.
>
> That will take then a second and intuitively move their mouse to a rsndom place and just click to see if their browser didn't froze up.
>
> However, during that click, hydration was happening already. So the main thread will only be idle after hydration is done.
>
> Anything from that interaction to an idle main thread (or just next possible frame/INP) will end up being your input delay. Especially when users didn't click on an interactive button, as it's less likely that you added event listeners to p elements that would otherwise lead to additional processing time as well.
>
> So that’s why You're probably seeing these numbers
>
> INP is a better metric than FID (taking more into account: more interactions and way more than just the input delay part)

Mystery solved. The million dolloar question is how to fix INP
