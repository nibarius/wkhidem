// ==UserScript==
// @name WaniKani hide mnemonics
// @namespace wkhidem
// @description Adds a possiblity to hide meaning and reading mnemonics during lessons and review.
// @include http://www.wanikani.com/review/session*
// @include http://www.wanikani.com/lesson/session*
// @version 1.0
// @author Niklas Barsk
// @run-at document-end
// @updateURL
// @downloadURL
// ==/UserScript==

/*
 * This script is licensed unter the MIT licence.
 */

/**
 * The character the current review/lesson page is for.
 */
var character = document.getElementById("character").textContent.trim();

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
 * Hide the reading and meaning sections if needed.
 */
function hideIfNeeded()
{
    if (localStorage.getItem(character + "_meaning") != null)
    {
        // Meaning currently hidden
        hide("meaning");
    }

    if (localStorage.getItem(character + "_reading") != null)
    {
        // Reading currently hidden
        hide("reading");
    }
}

/**
 * Hide the specified section.
 * @param which The section that should be hidden, either "reading" or "meaning".
 */
function hide(which)
{
    localStorage.setItem(character + "_" + which, 0);
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
    localStorage.removeItem(character + "_" + which);
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
    if (localStorage.getItem(character + "_" + which) != null)
    {
        // Header currently hidden
         textForHeader(which, "show", "note-" + which);
    }
    else
    {
        // Meaning/Reading is currently shown
        textForHeader(which, "hide", "item-info-" + which + "-mnemonic");

        // Make sure the default version of the Note header is displayed.
        var nh = document.getElementById("note-" + which).childNodes[0];
        nh.innerHTML = nh.firstChild.textContent;
    }
}
