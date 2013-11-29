// ==UserScript==
// @name WaniKani hide mnemonics
// @namespace wkhidem
// @description Adds a possiblity to hide meaning and reading mnemonics during lessons and review.
// @version 1.1
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

waitForKeyElements ("#item-info-meaning-mnemonic", init);

function init()
{
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
    setCorrectTextFor("reading");
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
    var type = document.getElementById("character").className;
    return type + "_" + character + "_" + which;
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

    if (isHidden("reading"))
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
    var element = document.getElementById("item-info-" + which + "-mnemonic");
    element.style.display="none"
    setCorrectText();
}

/**
 * Show the specified section.
 * @param which The section that should be shown, either "reading" or "meaning".
 */
function show(which)
{
    clearStorage(which);
    var element = document.getElementById("item-info-" + which + "-mnemonic");
    element.style.display=""
    setCorrectText();
}

/**
 * Set the correct text for reading/meaning/note header with the apropriate
 * show/hide link depending on what the current state is.
 *
 * @param which Specifies which header should be updated, the "reading" or "meaning" header.
 * @param action Specifies what happens when the header is pressed, either "show" or "hide".
 * @param headerID The ID of the header that should be updated.
 */
function textForHeader(which, action, headerID)
{
    var hide_meaning_HTML = "<span id=\"hide-meaning\"> (hide)</span>";
    var show_meaning_HTML = "<span id=\"show-meaning\"> (show original meaning)</span>";
    var hide_reading_HTML = "<span id=\"hide-reading\"> (hide)</span>";
    var show_reading_HTML = "<span id=\"show-reading\"> (show original explanation)</span>";
    var header = document.getElementById(headerID).childNodes[0];

    // Add the show/hide link to the header.
    header.innerHTML = header.firstChild.textContent + eval(action + "_" + which + "_HTML");

    // Set either hide(which) or show(which) as onclick handler.
    document.getElementById(action + "-" + which).onclick = function() { eval(action)(which);}
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
         textForHeader(which, "show", "note-" + which);
    }
    else
    {
        // Display the "hide" link in the header.
        textForHeader(which, "hide", "item-info-" + which + "-mnemonic");

        // Make sure the default version of the Note header is displayed.
        var nh = document.getElementById("note-" + which).childNodes[0];
        nh.innerHTML = nh.firstChild.textContent;
    }
}
