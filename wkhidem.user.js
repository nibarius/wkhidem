// ==UserScript==
// @name WaniKani hide mnemonics
// @namespace wkhidem
// @description Adds a possiblity to hide meaning and reading mnemonics during lessons and review.
// @version 1.2
// @author Niklas Barsk
// @include http://www.wanikani.com/review/session*
// @include http://www.wanikani.com/lesson/session*
// @require  http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_addStyle
// @run-at document-end
// @updateURL http://userscripts.org/scripts/source/184925.user.js
// ==/UserScript==

/*
 * This script is licensed under the MIT licence.
 */

waitForKeyElements("#item-info-meaning-mnemonic", init);
waitForKeyElements("#supplement-voc-meaning", function(){ initLearning("supplement-voc-");});
waitForKeyElements("#supplement-kan-meaning", function(){ initLearning("supplement-kan-");});
waitForKeyElements("#supplement-rad-meaning", function(){ initLearning("supplement-rad-name");});

function init()
{
    if (!sanityCheckPassed())
    {
        // Don't try to run the script if the HTML can't be parsed.
        console.warn("WaniKani hide mnemonics need to be updated to support the latest version of WaniKani.");
        return;
    }

    setCorrectText();
    hideIfNeeded();

    // Update visibility state when the "Show All Information" button is pressed.
    document.getElementById("all-info").addEventListener("click", hideIfNeeded);
}

/**
 * Set the correct text for the meaning and reading headers depending on
 * the current state.
 */
function setCorrectText()
{
    setCorrectTextFor("meaning");
    if (!isRadical())
    {
        setCorrectTextFor("reading");
    }
}

/**
 * Returns true if the mnemonic is hidden for the current character
 * and the given type.
 */
function isHidden(which)
{
    return localStorage.getItem(getStorageKey(which)) != null
}

/**
 * Set hidden status for the current character in the localStorage
 * for the give type.
 * @param "reading" or "meaning" depending on which key is desired.
 */
function setStorage(which)
{
    localStorage.setItem(getStorageKey(which), 0);
}

/**
 * Remove the stored information about the current character from
 * the localStorage for the give type.
 * @param "reading" or "meaning" depending on which key is desired.
 */
function clearStorage(which)
{
    localStorage.removeItem(getStorageKey(which));
}

/**
 * Get the key that the removed state for the current character is
 * stored under in the localStorage.
 * @param "reading" or "meaning" depending on which key is desired.
 */
function getStorageKey(which)
{
    var character = document.getElementById("character").textContent.trim();
    return getCharacterType() + "_" + character + "_" + which;
}

/**
 * Return the type of the character the page is for: a string containing
 * "vocabulary", "kanji" or "radical".
 */
function getCharacterType()
{
    if (isLesson())
    {
        return document.getElementById("main-info").className.trim();
    }
    else if (isReview())
    {
        return document.getElementById("character").className.trim();
    }
}

/**
 * Return true if the current page is for a radical.
 */
function isRadical()
{
    return getCharacterType() == "radical";
}

/**
 * Return true if the current page is for vocabulary.
 */
function isVocabulary()
{
    return getCharacterType() == "vocabulary";
}

/**
 * Returns true if the current page is a lesson.
 */
function isLesson()
{
    return document.URL.indexOf("lesson") != -1;
}

/**
 * Returns true if the current page is a review.
 */
function isReview()
{
    return document.URL.indexOf("review") != -1;
}

/**
 * Hide the reading and meaning sections if needed.
 */
function hideIfNeeded()
{
    if (isHidden("meaning"))
    {
        hide("meaning");
    }

    if (!isRadical() && isHidden("reading"))
    {
        hide("reading");
    }
}

/**
 * Hide the specified section.
 * @param which The section that should be hidden, either "reading" or "meaning".
 */
function hide(which)
{
    setStorage(which);
    getMnemonicContainer(which).style.display="none"
    setCorrectText();
}

/**
 * Show the specified section.
 * @param which The section that should be shown, either "reading" or "meaning".
 */
function show(which)
{
    clearStorage(which);
    getMnemonicContainer(which).style.display=""
    setCorrectText();
}

/**
 * Set the correct text for reading/meaning/note header with the apropriate
 * show/hide link depending on what the current state is.
 *
 * @param which Specifies which header should be updated, the "reading" or "meaning" header.
 * @param action Specifies what happens when the header is pressed, either "show" or "hide".
 * @param headerID The ID of the header that should be updated.
 * @param header The DOM element which should have its text updated.
 */
function textForHeader(which, action, header)
{
    // Add the show/hide link to the header.
    header.innerHTML = header.firstChild.textContent + getLinkHTML(which, action);

    // Set either hide(which) or show(which) as onclick handler for the new link.
    document.getElementById(action + "-" + which).onclick = function() { eval(action)(which);}
}

/**
 * Get the HTML for the show/hide link.
 * @param which Specifies if the link is for "reading" or "meaning".
 * @param action Specifies if the link is "hide" or "show".
 */
function getLinkHTML(which, action)
{
    // Examples of what the html looks like:
    // <span id="show-reading">(show original meaning)</span>
    // <span id="hide-meaning">(hide)</span>

    var linkText = action;
    if (action == "show")
    {
        if (isVocabulary())
        {
            linkText += " original explanation";
        }
        else
        {
            linkText += " original mnemonic";
        }
    }

    return "<span id=\"" + action + "-" + which + "\"> (" + linkText + ")</span>";
}

/**
 * Set the correct text for the specified header depending on the current state.
 * @param which The header that should be updated, either "reading" or "meaning".
 */
function setCorrectTextFor(which)
{
    if (isHidden(which))
    {
        // Display the "show" link in the note.
        textForHeader(which, "show", getNoteHeader(which));
    }
    else
    {
        // Display the "hide" link in the header.
        textForHeader(which, "hide", getMnemonicHeader(which));

        // Make sure the default version of the Note header is displayed.
        var nh = getNoteHeader(which);
        nh.innerHTML = nh.firstChild.textContent;
    }
}

/**
 * Get the DOM element that contains the mnemonic.
 * @param which Specifies if the header for the reading or meaning should
 *              be returned. The parameter is ignored for radicals since
 *              they only have one mnemonic.
 */
function getMnemonicContainer(which)
{
    if (isRadical())
    {
        return document.getElementById("item-info-col2").childNodes[0];
    }
    else
    {
        return document.getElementById("item-info-" + which + "-mnemonic");
    }
}

/**
 * Get the DOM element for the mnemonic header.
 * @param which Specifies if the header for the reading or meaning should
 *              be returned. The parameter is ignored for radicals since
 *              they only have one mnemonic.
 */
function getMnemonicHeader(which)
{
    return getMnemonicContainer(which).childNodes[0];
}

/**
 * Get the DOM element for the user notes header.
 * @param which Specifies if the notes header for the reading or meaning
 *              should be returned.
 */
function getNoteHeader(which)
{
    return document.getElementById("note-" + which).childNodes[0];
}

/**
 * Return true if critical assumptions made about the HTML code holds.
 */
function sanityCheckPassed()
{
    try
    {
        ensureElementExists("all-info");
        ensureElementExists("character");
        ensureElementExists("note-meaning");

        if (isRadical())
        {
            ensureElementExists("item-info-col2");
        }
        else
        {
            ensureElementExists("item-info-reading-mnemonic");
            ensureElementExists("item-info-meaning-mnemonic");
            ensureElementExists("note-reading");
        }

        if (isLesson())
        {
            ensureElementExists("main-info");
        }
    }
    catch (e)
    {
        console.error(e.toString());
        return false;
    }
    return true;
}

/**
 * Throws an exception if the given id doesn't exist in the DOM tree.
 */
function ensureElementExists(id)
{
    if (document.getElementById(id) == null)
    {
        throw new Error(id + " does not exist");
    }
}
///////////// Learning ///////////////

var idPrefix;

function getHeaders(which)
{
    var className = "pure-u-3-4";
    if (idPrefix == "supplement-rad-name")
    {
        className = "pure-u-1"
    }

    var id = idPrefix + which;
    var parent = document.getElementById(id).getElementsByClassName(className)[0];

    return {
        header: parent.children[0],
        explanation: parent.children[1],
        notes: parent.children[2]
        };
}

function initLearning(prefix)
{
    idPrefix = prefix;
    learningSetCorrectText();
    learningHideIfNeeded();
}

function learningSetCorrectText()
{
    learningSetCorrectTextFor("meaning");
    if (!isRadical())
    {
        learningSetCorrectTextFor("reading");
    }
}

function learningSetCorrectTextFor(which)
{
    if (isHidden(which))
    {
        // Display the "show" link in the note.
         learningTextForHeader(which, "show", getHeaders(which).notes);
    }
    else
    {
        // Display the "hide" link in the header.
        learningTextForHeader(which, "hide", getHeaders(which).header);

        // Make sure the default version of the Note header is displayed.
        var nh = getHeaders(which).notes;
        nh.innerHTML = nh.firstChild.textContent;
    }

}

function learningTextForHeader(which, action, header)
{
    // Add the show/hide link to the header.
    header.innerHTML = header.firstChild.textContent + getLinkHTML(which, action);

    // Set either hide(which) or show(which) as onclick handler.
    document.getElementById(action + "-" + which).onclick = function() { eval("learning_" + action)(which);}
}

function learning_show(which)
{
    console.log("show " + which);
    clearStorage(which);

    var element = getHeaders(which).header;
    element.style.display=""
    element = getHeaders(which).explanation;
    element.style.display=""

    learningSetCorrectText();
}

function learning_hide(which)
{
    console.log("hide " + which);
    setStorage(which);

    var element = getHeaders(which).header;
    element.style.display="none"
    element = getHeaders(which).explanation;
    element.style.display="none"

    learningSetCorrectText();
}

function learningHideIfNeeded()
{
    if (isHidden("meaning"))
    {
        learning_hide("meaning");
    }

    if (!isRadical() && isHidden("reading"))
    {
        learning_hide("reading");
    }
}
