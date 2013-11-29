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

waitForKeyElements("#item-info-meaning-mnemonic", init);
waitForKeyElements("#supplement-voc-meaning", function(){ initLearning("supplement-voc-");});
waitForKeyElements("#supplement-kan-meaning", function(){ initLearning("supplement-kan-");});
waitForKeyElements("#supplement-rad-meaning", function(){ initLearning("supplement-rad-name");});

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
    var character = document.getElementById("character").textContent.trim();
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
    var character = document.getElementById("character").textContent.trim();
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
    var character = document.getElementById("character").textContent.trim();
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
    var character = document.getElementById("character").textContent.trim();
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
    learningSetCorrectTextFor("reading");
}

function learningSetCorrectTextFor(which)
{
    var character = document.getElementById("character").textContent.trim();
    if (localStorage.getItem(character + "_" + which) != null)
    {
        // Header currently hidden, the note header needs a show link
         learningTextForHeader(which, "show", getHeaders(which).notes);
    }
    else
    {
        // Meaning/Reading is currently shown, the header needs a hide link
        learningTextForHeader(which, "hide", getHeaders(which).header);

        // Make sure the default version of the Note header is displayed.
        var nh = getHeaders(which).notes;
        nh.innerHTML = nh.firstChild.textContent;
    }

}

function learningTextForHeader(which, action, header)
{
    var hide_meaning_HTML = "<span id=\"hide-meaning\"> (hide)</span>";
    var show_meaning_HTML = "<span id=\"show-meaning\"> (show original meaning)</span>";
    var hide_reading_HTML = "<span id=\"hide-reading\"> (hide)</span>";
    var show_reading_HTML = "<span id=\"show-reading\"> (show original explanation)</span>";

    // Add the show/hide link to the header.
    header.innerHTML = header.firstChild.textContent + eval(action + "_" + which + "_HTML");

    // Set either hide(which) or show(which) as onclick handler.
    document.getElementById(action + "-" + which).onclick = function() { eval("learning_" + action)(which);}
}

function learning_show(which)
{
    console.log("show " + which);
    var character = document.getElementById("character").textContent.trim();
    localStorage.removeItem(character + "_" + which);

    var element = getHeaders(which).header;
    element.style.display=""
    element = getHeaders(which).explanation;
    element.style.display=""

    learningSetCorrectText();
}

function learning_hide(which)
{
    console.log("hide " + which);
    var character = document.getElementById("character").textContent.trim();
    localStorage.setItem(character + "_" + which, 0);

    var element = getHeaders(which).header;
    element.style.display="none"
    element = getHeaders(which).explanation;
    element.style.display="none"

    learningSetCorrectText();
}

function learningHideIfNeeded()
{
    var character = document.getElementById("character").textContent.trim();
    if (localStorage.getItem(character + "_meaning") != null)
    {
        // Meaning currently hidden
        learning_hide("meaning");
    }

    if (localStorage.getItem(character + "_reading") != null)
    {
        // Reading currently hidden
        learning_hide("reading");
    }
}