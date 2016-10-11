import React from 'react'
import { platform } from '../unistats.js'
import uniwindow from '../#{unistats|platform}/uniwindow.js'
import { initialRender } from '../helpers/helpers.js'

const DomRebel = ({ dispatch, getState }) => {
    if (platform === 'node') return null
    if (initialRender()) return null

    const page = getState().page
    const unidoc = uniwindow.document
    const {
        baseTitle: { children: baseTitle },
        title: { children: title }
    } = page
    setTitle(title || baseTitle, unidoc)

    const { scripts, updateScripts } = page
    if (updateScripts) {
        const existingScripts = unidoc.body.getElementsByTagName('script')
        clearExistingScripts(existingScripts)
        insertScripts(scripts, unidoc.body, unidoc)
    }

    const { styles, updateStyles } = page
    if (!updateStyles) {
        const existingStyles = unidoc.head.getElementsByTagName('link')
        console.log('existingStyles', existingStyles)
    }

    return null
}

const setTitle = (newTitle, unidoc) => {
    if (unidoc.title !== newTitle) unidoc.title = newTitle
}

const clearExistingScripts = (scripts) => {
    const baseURL = window.location.origin
    Object
    .keys(scripts)
    .map(key => {
        const element = scripts[key]
        const relativePath = element.src.replace(baseURL, '')
        return { element, relativePath }
    })
    .forEach(({ element, relativePath }) => {
        if (relativePath.startsWith('/dist')) {
            // console.log('Removed external', relativePath)
            element.parentNode.removeChild(element)
        }
    })
}

// reference:
// http://stackoverflow.com/questions/17380744/replace-dom-with-javascript-and-run-new-scripts
const insertScripts = (scripts, element, unidoc, index = 0) => {
    if (scripts.length === index) return

    const script = scripts[index]
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
            insertScripts(scripts, element, unidoc, ++index)
        }
    }
    // Callback on most browsers when a script fails to load
    function continueLoadingOnError() {
        // Defend against duplicate calls
        if (this === newscript) {
            insertScripts(scripts, element, unidoc, ++index)
        }
    }
    // Callback on IE when a script's loading status changes
    function continueLoadingOnReady() {
        // Defend against duplicate calls and check whether the
        // script is complete (complete = loaded or error)
        if (this === newscript && this.readyState === 'complete') {
            insertScripts(scripts, element, unidoc, ++index)
        }
    }
}

export default DomRebel
