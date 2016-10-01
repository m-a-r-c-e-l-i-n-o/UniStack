# UniStack
[![Coverage Status](https://coveralls.io/repos/github/m-a-r-c-e-l-i-n-o/unistack/badge.svg?branch=master)](https://coveralls.io/github/m-a-r-c-e-l-i-n-o/unistack?branch=master)
[![Build Status](https://travis-ci.org/m-a-r-c-e-l-i-n-o/unistack.svg?branch=master)](https://travis-ci.org/m-a-r-c-e-l-i-n-o/unistack)

UniStack is a future proof, isomorphic JavaScript framework that aims to provide a complete set of features necessary for a modern, scalable, single-page application, and doing so with zero configuration. Well... that's the goal and thus far it looks promising — thanks to some ingenious open source tools created by humans a bit smarter than me.

**_UniStack is in beta, under heavy construction, and currently offers no testing or production bundling capabilities.
Use it at your own risk. Only tested on Linux Ubuntu 16.04 with Node 5+, and a chrome browser._**

## Quickstart
##### 1) Install UniStack:
```bash
npm install -g unistack
```
##### 2) Initialize project on the desired directory:
```bash
DEBUG=unistack:* unistack
```
<sub>*The command should be just "unistack", but although noisy, debug feedback is a very good idea at this stage.*</sub>
##### 3) Wait for instructions
On the terminal you should see "`@@@@@@@@@@@@: Open browser to: http://localhost:8080`" at some point.
That's the indication that the server is ready and you may open the browser.
Once the browser is open, you should see the markup rendered right away, but open the console
and wait for a "`Local components are now synced with server rendered components.`" and a "`Socket connected!`"
message to appear before manipulating files.
The redux and react dev tools is also available by default, feel free to install those extensions.
##### 4) Modify files
Hot reloading is avaliable to any files in the "src" directory. Perhaps the "routes.js" file might be a good place to start.
CSS hot reloading is also available and that can be seen by modifing files in the "dist/css" folder.
##### 5) Have fun :]
