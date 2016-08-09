var Message = {
    success: {},
    update: {},
    error: {}
}

module.exports = Message

// SUCCESS MESSAGES
Message.success.CORE_READY = `
The core process has started succesfully.
`
Message.success.CORE_EXIT = `
The core process has exited succesfully.
`
Message.success.UNKNOWN_CORE_EXIT = `
The core process has exited unexpectedly,
there doesn't seem to be errors.
`

// UPDATE MESSAGES
Message.update.PROMPT_FOR_COMMAND = `
What would you like to do next?
`
Message.update.CORE_CLOSE = `
Attempting to close core process...
`

// ERROR MESSAGES
Message.error.EMPTY_COMMAND = `
Please enter a valid command.
`
Message.error.INVALID_CONFIG_PATH = `
Please provide a valid configuration filename.
The filename received ({{filename}}) could not be loaded.
`
Message.error.INSTALLATION_DIRECTORY_IS_POPULATED = `
This directory must be empty before installation can commence.
Please manually deleted all files (including hidden ones) from directory.
`
Message.error.NOT_UNISTACK_ENVIRONMENT = `
It appears that this directory is not an unistack environment. If there is a
high degree of confidence that this is in fact a unistack environment,
try reinserting a "unistack" property with a truthy value in the package.json
file and run the "start" command below to retry starting the dev environment.
However, it's crucial to understand how this property went missing in
the first place, as other parts of the system could have been impacted.
`
Message.error.NO_ENVIRONMENT_PACKAGE_JSON_FILE = `
It appears that this directory is not an unistack environment. This was
determined do to a failure in loading up the package.json file that holds
information about the environment. If there is a high degree of confidence
that this is in fact a unistack environment, try restating a package.json
file and run the "start" command below. If there is a high degree of confidence
that this is NOT a unistack environment, delete all files in the directory
and run the "init" command below to setup a new environment.
`
Message.error.EXIT = `
UniStack exited unexpectedly with the following error:
{{error_stack}}
`
Message.error.CORE_EXIT = `
The core process has exited unexpectedly, for the following reason:
{{error_stack}}
`
Message.error.UNKNOWN_CORE_EXIT = `
The core process has exited unexpectedly for unknown reasons.
`
Message.error.UNKNOWN_CORE_EXIT_CODE = `
The core process has unexpectedly exited with an unrecognized exit code for
unknown reasons.
`
Message.error.INVALID_MESSAGE_ACTION = `
Failed to create message transport.
The action provided ("{{ACTION}}") does not have message associated with it.
Please ensure that there is message describing this action.
* Remember, the "action"'s text should be all uppercase!
`
Message.error.INVALID_MESSAGE_TYPE =
Message.error.INVALID_TRANSPORT_TYPE = `
Failed to create message transport.
The type provided "{{TYPE}}" is not valid.
Valid types: "{{VALID_TYPES}}"
* Remember, the "type"'s text should be all lowercase!
`
Message.error.INVALID_MESSAGE_TEMPLATE = `
Failed to create message transport.
The following template place holders are missing or not valid:
"{{MISMATCHED_PLACE_HOLDERS}}"
Valid places holders: "{{PLACE_HOLDERS}}"
* Remember, the place holders' text should be all uppercase!
`
