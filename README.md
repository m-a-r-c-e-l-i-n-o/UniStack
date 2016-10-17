# UniStack
[![Coverage Status](https://coveralls.io/repos/github/m-a-r-c-e-l-i-n-o/unistack/badge.svg?branch=master)](https://coveralls.io/github/m-a-r-c-e-l-i-n-o/unistack?branch=master)
[![Build Status](https://travis-ci.org/m-a-r-c-e-l-i-n-o/unistack.svg?branch=master)](https://travis-ci.org/m-a-r-c-e-l-i-n-o/unistack)

UniStack is a JavaScript development environment, collection of utilities, and application framework that aims to provide a complete set of features necessary for a modern, single-page application, and does so with emphasis on scalability and the elimination of configuration. Well... that's the goal and thus far it looks promising — thanks to some ingenious open source tools created by humans a bit smarter than me.

**_UniStack is in beta, under heavy construction, and currently offers no testing or production bundling capabilities out of the box
(there are technically no barriers to make production bundles using the jspm binary included in node modules),
and one could technically set up testing for the application code using [N.U.T.R.A.](https://github.com/m-a-r-c-e-l-i-n-o/nutra)
and [nutra-jspm](https://github.com/m-a-r-c-e-l-i-n-o/nutra-jspm), but the lack of documentation will likely make this a hassle for
anyone unfamiliar with nutra/systemjs.
Use it at your own risk. Only tested on Linux Ubuntu 16.04 with Node 5+, and a chrome browser.
Also worth noting that the development environment and collection of utilities is somewhat coupled to the framework at this point,
but that will change soon and one will not require the others -- making this project potentially more useful to more people._**

## Why?
There are four audiences that could likely benefit from UniStack, which includes those contemplating a transition from:

1. Other application types into web technologies.
2. Inadequate web technologies and practices into something a bit more modern and structured, with a healthy scoop of future proofing.
3. Other modern stack combinations and practices into a more functional, uni-directional, and ES6/7 powered stack.
4. Those contemplating a transition from other modern stack combinations into a "Redux, React, Koa, GraphQL, JSPM" stack.

As time allows and the project matures, a write up specific to each audience will be made. But for now, I've included, below, a quick overview primarily targeted at group four, with the assumption that if one is contemplating a transition into the "Redux, React, Koa, GraphQL, JSPM" paradigm, that one must have done some research into why the transition would make sense for them and that one has some reasonable level of knowledge about how these tools work.

So without further ado, here's what UniStack offers out of the box:

## Development Environment:
##### INCLUDED:
- Creates the necessary UniStack files that power the application layer.
- Installs NPM and JSPM stack dependencies.
- Sets up CSS and [JS hot reloading](https://github.com/capaj/systemjs-hot-reloader) and browser reload for server side bundle changes.
- Manages the server side bundling life cycle, including error handling.
- Keeps itself simple with a single command that works for setting up the above tasks and intelligently launching future development sessions.

##### PENDING:
- CSS preprocessing with support for Gulp plugins.
- Package installations. (Alternative: `npm run jspm -- install "PACKAGE_NAME"`)

## Application Framework:
Includes and configures:
- A Redux store, with support for doing [asynchronous actions](https://github.com/gaearon/redux-thunk) and other enhancements to make [Redux integrate well with React](https://github.com/reactjs/react-redux), along with [enabling the redux devtools](https://github.com/gaearon/redux-devtools).
- A [simple routing mechanism](https://github.com/reactjs/react-redux).
- An application server based on Koa.
- Useful hooks and helpers to manage the rendering cycle of the application. Here's a brief overview of those:

##### Server Rendered Page:
_What?_ The "Server Rendered Page" is the markup of a particular page rendered on the server and sent to the client upon request. This would produce results identical to letting the app render one synchronous Redux state cycle on the client.

_Why?_ This is primarily useful for [search engine optimization](https://en.wikipedia.org/wiki/Search_engine_optimization) since most search engines are currently not able to determine when and how dynamic content is rendered on the client, and it is also useful for a [subset of search engine optimizations pertaining to page load times](https://blog.kissmetrics.com/speed-is-a-killer), in the sense that [perceived load times](http://blog.teamtreehouse.com/perceived-performance) seems to be just as important to the user as the actual load times is important to the search engine.

_How?_ UniStack considers part of the application to be isomorphic, which is essentially comprised of the React component tree. It is this part of the application that UniStack attempts to render on the server. Since the component tree is technically necessary for the client, whatever is written for the client can be rendered by server without any additional configuration.

##### Dynamic Server Rendered Page:
_What?_ The "Dynamic Server Rendering" is the process where Unistack will allow one synchronous Redux state cycle to run in order to gather requests, batch process them at the end of the cycle, and allow for a second synchronous cycle to occur before generating the final output.

_Why?_ This is primarily useful for sending a "Server Rendered Page" populated with dynamic content. This also makes the application on the client side more efficient by grouping requests, and sending out a single http request.

_How?_ UniStack makes a helper method called "request" available as props to the "Container Components".
</sub>*This should only be used for interations with the application server. Use "fetch" for remote requests, an isomorphic fetch implemention is globally available in the application code. Also worth noting that requests made with "request" does not actually trigger http fetches when rendering on the server, instead it invokes the API resolution method directly.*</sub>

##### Base Layout Component:
_What?_ The "Base Layout Component" is a component containing the literal HTML that is sent by the server upon the initial request.

_Why?_ This enables the ability to define any static HTML elements that are outside the realms of React, most notably, page icons (i.e. favicon, apple-touch-icon, etc...).

_How?_ UniStack leaves a populated `base-layout.js` file in the project's `src` folder.

##### Layout Component:
_What?_ The "Layout Component" is a function that servers as a wrapper for a "Page Component".

_Why?_ This is useful for rendering other components as well as other page assets (title, styles, scripts, etc...) that are common to all pages.

_How?_ UniStack makes these methods (baseTitle, baseScripts, baseStyles) available as props to the "Layout Component".

##### Page Component:
_What?_ The "Page Component" is a function that is invoked upon entering a page.

_Why?_ This is useful for rendering a set of relevant page container components as well as other page assets (title, styles, scripts, etc...) specific to the page.

_How?_ UniStack makes these methods (title, styles, and scripts) available as props to the "Page Component".

##### Container Components:
_What?_ The "Container Components" are functions that are invoked upon state changes.

_Why?_ This is useful for managing state changes and rendering visual components accordingly. This is also a good point in the render cycle to orchestrate asynchronous requests.

_How?_ UniStack makes these methods (dispatch, request) and a state object available as props to the "Container Components".

##### Presentational Components:
_What?_ The "Presentational Components" are data unaware React components that will define what the visual pieces will look like.

_Why?_ The HTML building blocks need to come from somewhere, and by making these components data unaware, one can reuse them anywhere in the system with the certainty that they will not sabotage their own visuals with unintended data.

_How?_ Ensure that the only data the component gets comes from its props.

## External Utilities:
_What?_ The "External Utilities" is a set of browser based tools that enable interactive interactions with the development environment and framework. At the moment this is coupled to the framework, but it's really not meant to the embedded, so that will change soon.

_Why?_ Among other things that will be included before beta is over, it is currently useful for testing and validating queries against a data layer (GraphQL).

_How?_ UniStack makes these utilities available at "http://{{domain}}:{{port}}/\_\_UNISTACK\_\_"

##### INCLUDED:
##### GraphiQL:
Please see the [GraphiQL github page](https://github.com/graphql/graphiql), not to be confused with [GraphQL](https://github.com/graphql/graphql-js) or [GraphQL itself](http://graphql.org/).

##### PENDING:
Production Bundler

## Quickstart (Beta)
##### 1) Install UniStack:
```bash
npm install -g unistack
```
##### 2) Initialize project on the desired directory:
```bash
DEBUG=unistack:* unistack
```
<sub>*The command should just be "unistack", but although noisy, debug feedback is a very good idea at this stage.*</sub>
##### 3) Wait for instructions
On the terminal you should see "`@@@@@@@@@@@@: Open browser to: http://localhost:8080`" at some point.
That's the indication that the server is ready and you may open the browser.
Once the browser is open, you should see the HTML rendered right away, but open the console
and wait for a "`Local components are now synced with server rendered components.`" and a "`Socket connected!`"
message to appear before manipulating files.
The redux and react dev tools are available by default, feel free to install those extensions.
##### 4) Modify files
JS hot reloading is avaliable to any files in the "src" directory. Perhaps the "routes.js" file might be a good place to start.
CSS hot reloading is avaliable to any files in the "dist/css" folder.
##### 5) Create Production Bundles
Node:
```bash
npm run jspm -- build ./bootstrap/src/node.js ./dist/js/node.bundle.js --production --node --conditions "{'unistack/uni|platform': 'node', 'unistack/uni|environment': 'production'}"
```
Browser:
```bash
npm run jspm -- build ./bootstrap/src/browser.js ./dist/js/browser.bundle.js --production --minify --conditions "{'unistack/uni|platform': 'browser', 'unistack/uni|environment': 'production'}"
```
<sub>*For multiple bundles, use systemjs builder's [bundle arithmetic.](https://github.com/systemjs/builder#bundle-arithmetic)*</sub>
##### 6) Have fun :]

