---
draft: false
title: "Avoid using React.cloneElement"
snippet: ""
image:
  {
    src: "https://www.gauraw.com/wp-content/uploads/2014/05/writing-not-to-do-list-is-as-important-as-to-do-list-for-effective-productivity-in-life.png",
    alt: "React.cloneElement is fragile and expensive",
  }
publishDate: "2024-4-15 21:00"
category: "INP "
author: "x.d"
tags: [inp]
---

## React.cloneElement is fragile, expensive and deprecated

Recently saw that some code is plastered with <code>React.cloneElement</code>, which [React](https://react.dev/reference/react/cloneElement) has clearly put into its legacy, _Do-Not-Use_ bin.

## Why we should avoid `React.cloneElement`

- `cloneElement` is fragile
- Performance: Cloning an element creates a new element, which could have performance implications
- Readability and maintainability: Using `React.cloneElement` can make the code harder to understand and maintain.

## A sample replacement `React.cloneElement`

We can replace the following

```
cloneElement(
			children,
			context.getReferenceProps({
				ref,
				...props,
				...children.props,
				'data-state': context.open ? 'open' : 'closed',
			})
)
```

with

```
	const ChildComponent = children.type;
  const newProps = context.getReferenceProps({
    ref,
    ...props,
    ...children.props,
    'data-state': context.open ? 'open' : 'closed',
  });

	return <ChildComponent {...newProps} />;
```
