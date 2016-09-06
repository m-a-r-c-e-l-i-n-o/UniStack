export const BUNDLE_BUILD_ERROR = `
Something went wrong while attempting to modify the bundles.
The following file:
"{{FILENAME}}"
is invalid (actual error listed below).
It needs to be fixed before UniStack can proceed.
Actual Error: {{ERROR}}
`

export const UNKNOWN_BUNDLE_BUILD_ERROR = `
Something went wrong while attempting to modify a bundle.
Actual Error: {{ERROR}}
`

export const UNKNOWN_BUNDLER_INITIALIZATION_ERROR = `
Something went wrong while attempting to initialize the bundlers responsible for
producing the node and browser bundles.
Actual Error: {{ERROR}}
`

export const UNKNOWN_SERVER_ERROR = `
Something went wrong while attempting to modify the state of the environment
server. This might not be much cause for alarm, but it might cause some
port-in-use errors if the server was not closed properly.
Actual Error: {{ERROR}}
`

export const UNKNOWN_ENV_DIRECTORY_ERROR = `
Something went wrong while attempting to access the environment directory.
Actual Error: {{ERROR}}
`

export const UNKNOWN_ENV_COPY_ERROR = `
Something went wrong while attempting to place the necessary files in the
environment.
Actual Error: {{ERROR}}
`

export const UNKNOWN_ENV_PACKAGE_JSON_ERROR = `
Something went wrong while attempting to open the environment's package.json
file.
Actual Error: {{ERROR}}
`

export const UNKNOWN_PACKAGE_INSTALL_ERROR = `
Something went wrong while attempting to install the initial packages.
Actual Error: {{ERROR}}
`

export const UNKNOWN_ENV_SERVER_SHUT_DOWN_ERROR = `
Something went wrong while attempting to shut down the environment server.
Actual Error: {{ERROR}}
`

export const INVALID_DYNAMIC_COMPONENT = `
Cannot subscribe component without an update method.
`

export const LIKELY_NOT_UNI_ENV = `
The initiator was unable to verify that this is a valid UniStack environment and
aborted. If you believe this to be a mistake, please open the package.json file
located in the root of the environment and set the "unistack" property to a
truthy value. If the "unistack" property is already set to a truthy value,
please verify that you are not in the wrong directory.
`

export const INSTALLATION_DIRECTORY_NOT_EMPTY = `
The initiator was unable to install UniStack because the installation directory
is not empty. Please empty the directory and try again. Hidden files are okay.
`
