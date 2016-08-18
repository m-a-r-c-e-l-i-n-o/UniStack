# UniStack
[![Coverage Status](https://coveralls.io/repos/github/m-a-r-c-e-l-i-n-o/unistack/badge.svg?branch=master)](https://coveralls.io/github/m-a-r-c-e-l-i-n-o/unistack?branch=master)
[![Build Status](https://travis-ci.org/m-a-r-c-e-l-i-n-o/unistack.svg?branch=master)](https://travis-ci.org/m-a-r-c-e-l-i-n-o/unistack)

**_UniStack is still under heavy construction and currently not in a usable state, but should be in beta by September 1st._**

UniStack is a future proof, isomorphic JavaScript framework — bundled with all the features necessary for a modern, scalable single-page application.

Current features (no documentation yet):
- Fully isomorphic (components, testing, etc)
- Universal module loading (powered by SystemJS under the hood - ESM, CommonJS, AMD, Global...)
- Full support for ES6/7, React, Redux, and Redux dev tools
- Full support for client and server unit testing
- Simple, yet robust routing
- Auto file watching and bundling
- Support for production ready bundles
- Browser hot reloading (nearly instantaneous)
- Auto browser/server reloading (reload times around 2 seconds)
- SEO friendly (thanks to the server side rendering)
- Virtually no initial configuration (I know, it's a shocker)

Pending features (no documentation yet):
- Overwritable bootstrap. (Which means no hacks while waiting for pull requests. Also allows for replacement of React, Redux, and all the built-in server components with whatever, while keeping the rest of the environment features intact.)
- Model-View-Controller (MVC) backend architecture
- Simple CSS file preprocessing via Gulp plugins
- GraphQL integration as the API for interacting with the server
- Flow intergration (have seriously comtemplated typescript)
- Quick install through npm
- Open to suggestions!

The Vision
The main objective of UniStack is to get you up and running in a production
ready environment with zero configuration. A typical starter workflow would be
as follows:
- Install UniStack globally using a package manager (i.e. npm)
- Run the UniStack command (i.e. unistack init) on the desired directory
- Create a react page component in the "shared/components" folder now present in the directory
- Point an endpoint to the component using the routes file located in the "shared" folder

<sub>*Established conventions for doing ajax calls and retrieval of data on the backend to populate dynamic components are included and will be documented once all features are complete.*</sub>
