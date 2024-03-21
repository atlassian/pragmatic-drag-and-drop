

<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/alexreardon/files/assets/2182637/4405f071-4d88-4ad7-bcc0-a050420f3f3e" height="372px" width="372px" aria-label="Pragmatic drag and drop logo">
  <img src="https://github.com/alexreardon/files/assets/2182637/9e57e0bb-aa9b-4552-affa-59aecf70bfc0" height="372px" width="372px" aria-label="Pragmatic drag and drop logo">
</picture>

_Fast drag and drop for any experience on any tech stack_

[📖 **Documentation**](https://atlassian.design/components/pragmatic-drag-and-drop) | [🤹 **Examples**](https://atlassian.design/components/pragmatic-drag-and-drop/examples) | [🎥  **How it works**](https://www.youtube.com/watch?v=5SQkOyzZLHM)

![Show case of some examples](https://github.com/alexreardon/files/assets/2182637/2b533f88-bf3f-402f-93f2-74a466918ac4)

</div>

<br/>

## About

Pragmatic drag and drop is a low level drag and drop toolchain that enables safe and successful usage of the browsers built in drag and drop functionality. Pragmatic drag and drop can be used with any view layer ([`react`](https://react.dev/), [`svelte`](https://svelte.dev/), [`vue`](https://vuejs.org/), [`angular`](https://angular.io/) and so on). Pragmatic drag and drop is powering some of the biggest products on the web, including [Trello](https://trello.com), [Jira](https://www.atlassian.com/software/jira) and [Confluence](https://www.atlassian.com/software/confluence).

<details>
    <summary>Capabilities</summary>

Pragmatic drag and drop consists of a few high level pieces:

1. **Low level drag and drop behavior**

Pragmatic drag and drop contains a core package, and a number of optional packages, that provide you the pieces to create _any_ drag and drop experience.

These pieces are unopinionated about visual language or accessibility, and have no dependency on the Atlassian Design System.

- _Tiny_: ~`4.7kB` core
- _Incremental_: Only use the pieces that you need
- _Headless_: Full rendering and style control
- _Framework agnostic_: Works with any frontend framework
- _Deferred compatible_: Delay the loading the cord packages and optional packages in order to further improve page load speeds
- _Flexible_: create any experience you want, make any changes you want during a drag operation.
- _Works everywhere_: Full feature support in Firefox, Safari, and Chrome, iOS and Android
- _Virtualization support_: create any virtual experience you want!

2. **Optional visual outputs**

We have created optional visual outputs (eg our drop indicator) to make it super fast for us to build consistent Atlassian user experiences. Non Atlassian consumers are welcome to use these outputs, create their own that copy the visual styling, or go a totally different direction.

3. **Optional assistive technology controls**

Not all users can achieve pointer based drag and drop experiences. In order to achieve fantastic experiences for assistive technology users, we provide a toolchain to allow you to quickly wire up performant assistive technology friendly flows for any experience.

The optional assistive controls we provide are based on the Atlassian Design System. If you do not want to use the Atlassian Design System, you can use our guidelines and substitute our components with your own components, or you can go about accessibility in a different way if you choose.

</details>

## What is this repository?

This repository is currently one way mirror from our internal monorepo that contains all the code for Pragmatic drag and drop. The intention of this repository is to make public our code, but not to accept code contributions (at this stage). In the future we could explore setting up a two way mirror so that contributions to this repo can also make their way back to our monorepo. You are still welcome to raise issues or suggestions on this repository!

All documentation and `npm` packages are public and available for use by everyone

## Can I use this with my own Design System?

Yep! Pragmatic drag and drop as a [small core package](https://atlassian.design/components/pragmatic-drag-and-drop/core-package), and then a range of [optional packages](https://atlassian.design/components/pragmatic-drag-and-drop/optional-package). Some of the optional packages have dependencies on styling solutions (eg `emotion`), view libraries (eg `react`) or on some additional Atlassian outputs (eg `@atlaskit/tokens`). We have separated out optional packages that have other dependencies so they can be easily swapped with your own pieces that use your own tech stack and visual outputs.

## Can I use my own design language?

Yep! We have created some design guidelines which embody how we want to achieve drag and drop in our products, and some of those decisions are embodied in some optional packages. However, you are free to use whatever design language you like, including ours!

## What is `@atlaskit`?

`@atlaskit` is the `npm` namespace that we publish all of our public packages on from inside our monorepo. We _could_ look at creating a separate namespace in the future just for Pragmatic drag and drop. If we do that, we'll release some tooling to help folks automatically switch over.

## Credits

Made with love by:

- [Alex Reardon](https://twitter.com/alexandereardon)
- [Declan Warn](https://twitter.com/DeclanWarn)
- [Eleni Misthos](https://www.linkedin.com/in/elenimisthos/)
- [Lewis Healey](https://twitter.com/lewishealey)
- [Jesse Bauer](https://soundcloud.com/jessebauer)
- [Mitch Gavan](https://twitter.com/MitchG23)
- [Michael Abrahamian](https://twitter.com/michaelguitars7)
- [Many other folks at Atlassian](https://www.atlassian.com/)

Logo created by [Michelle Holik](https://twitter.com/michelleholik) and [Vojta Holik](https://twitter.com/vojta_holik)
