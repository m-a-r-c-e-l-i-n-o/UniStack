import React from 'react'
import { platform } from '../../unistats.js'
import unidocument from '../../#{unistats|platform}/unidocument.js'

const DomRebel = ({ title, bodyScripts }) => {
    if (platform === 'node') return null
    const unidoc = unidocument()
    unidoc.title = title
    const existingBodyScripts = unidoc.body.getElementsByTagName('script')
    Object.keys(existingBodyScripts).map(key => obj[key]).forEach(script => {
        script.parentNode.removeChild(script)
    })
    insertScripts(bodyScripts, unidoc.body, unidoc)
    return null
}

// reference:
// http://stackoverflow.com/questions/17380744/replace-dom-with-javascript-and-run-new-scripts
const insertScripts = (scripts, element, unidoc) => {
    const script = scripts.shift()
    if (!script) return

    const newscript = unidoc.createElement('script')
    // External?
    if (script.src) {
        // Yes, we'll have to wait until it's loaded before continuing
        newscript.onerror = continueLoadingOnError
        newscript.onload = continueLoadingOnLoad
        newscript.onreadystatechange = continueLoadingOnReady
        newscript.src = script.src
    } else {
        // No, we can do it right away
        newscript.text = script.innerHTML
    }

    // Start the script
    element.appendChild(newscript)

    // Callback on most browsers when a script is loaded
    function continueLoadingOnLoad() {
        // Defend against duplicate calls
        if (this === newscript) {
            insertScripts(scripts, element, unidoc)
        }
    }
    // Callback on most browsers when a script fails to load
    function continueLoadingOnError() {
        // Defend against duplicate calls
        if (this === newscript) {
            insertScripts(scripts, element, unidoc)
        }
    }
    // Callback on IE when a script's loading status changes
    function continueLoadingOnReady() {
        // Defend against duplicate calls and check whether the
        // script is complete (complete = loaded or error)
        if (this === newscript && this.readyState === 'complete') {
            insertScripts(scripts, element, unidoc)
        }
    }
}

export default DomRebel
