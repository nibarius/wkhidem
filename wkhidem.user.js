// ==UserScript==
// @name WaniKani hide mnemonics
// @namespace wkhidem
// @description Adds a possiblity to hide meaning and reading mnemonics during lessons and review.
// @version 1.2
// @author Niklas Barsk
// @include http://www.wanikani.com/review/session*
// @include http://www.wanikani.com/lesson/session*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require https://raw.github.com/meetselva/attrchange/master/attrchange.js
// @grant   GM_addStyle
// @run-at document-end
// @updateURL http://userscripts.org/scripts/source/184925.user.js
// ==/UserScript==

/*
 * This script is licensed under the MIT licence.
 */

// review/lessons quiz
waitForKeyElements("#item-info-meaning-mnemonic", init);

// The different types of lesson pages (non-quiz mode)
waitForKeyElements("#main-info.radical", initLesson);
waitForKeyElements("#main-info.kanji", initLesson);
waitForKeyElements("#main-info.vocabulary", initLesson);

function initLesson()
{
    init();

    // The lessons are loaded in batches of several items and when
    // switching page new data is updated via javascript and not by
    // loading a new web page. Set up a listener that listens to
    // changes to the main-info element and calls init() again
    // whenever it changes.
    $("#main-info").attrchange({
        trackValues: false,
        callback: function(e)
        {
            init();
        }});
}

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

    if (isQuiz())
    {
        // Update visibility state when the "Show All Information" button is pressed.
        document.getElementById("all-info").addEventListener("click", hideIfNeeded);
    }
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
    if (character == "")
    {
        // Radical with image instead of text.
        var src = document.getElementById("character").children[0].getAttribute("src");
        character = src.split("/").pop()
    }
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
 * Returns true if the user is currently doing a quiz.
 */
function isQuiz()
{
    if (isReview())
    {
        return true;
    }
    var mainInfo = document.getElementById("main-info");
    return mainInfo.parentElement.className == "quiz";
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
    setDisplayStyle(which, "none");
    setCorrectText();
}

/**
 * Show the specified section.
 * @param which The section that should be shown, either "reading" or "meaning".
 */
function show(which)
{
    clearStorage(which);
    setDisplayStyle(which, "");
    setCorrectText();
}

/**
 * Set the display style of the hidable section.
 * @param which The section that should be updated, either "reading" or "meaning".
 * @param display The new value of the display css property.
 */
function setDisplayStyle(which, display)
{
    var children = getHidableElements(which);
    for (i = 0; i < children.length; ++i)
    {
        children[i].style.display = display;
    }
}

/**
 * Returns an array with all elements that should be hidden or
 * shown when the hide/show link is clicked.
 * @param Specifies if it's the "reading" or "meaning" that should be hidden
 */
function getHidableElements(which)
{
    // return an array of items to hide/show
    var ret = [];
    if (isQuiz())
    {
        ret.push(getMnemonicContainer(which));
    }
    else
    {
        var children = getLearningContainer(which).children;
        for (i = 0; i < children.length - 2; ++i) // note section is last 2 elments.
        {
            ret.push(children[i]);
        }
    }
    return ret;
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
    document.getElementById(getLinkId(which, action)).onclick = function() { eval(action)(which);}
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

    return "<span id=\"" + getLinkId(which, action) + "\"> (" + linkText + ")</span>";
}

/**
 * Return the id of the show/hide link.
 */
function getLinkId(which, action)
{
    return action + "-" + which + "-" + getCharacterType();
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
        return document.getElementById("item-info-col2").children[0];
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
    if (isQuiz())
    {
        return getMnemonicContainer(which).children[0];
    }
    else
    {
        return getLearningContainer(which).children[0];
    }
}

/**
 * Get the DOM element for the user notes header.
 * @param which Specifies if the notes header for the reading or meaning
 *              should be returned.
 */
function getNoteHeader(which)
{
    if (isQuiz())
    {
        return document.getElementById("note-" + which).children[0];
    }
    else
    {
        var container = getLearningContainer(which);
        return container.children[container.children.length - 2];
    }
}

/**
 * Get the container element of the mnemonics and notes in the learning
 * part of lessons. There is no id available for the actual headers and
 * mnemonics like in the quiz so the container element is the closest
 * we get.
 *
 * @param which Specifies if it's the container for "reading" or "meaning"
 *              that is desired.
 */
function getLearningContainer(which)
{
    var id = "supplement-" + getCharacterType().substring(0,3) + "-";
    var className = "pure-u-3-4";
    if (isRadical())
    {
        id += "name";
        className = "pure-u-1"
    }
    else
    {
        id += which;
    }

    return document.getElementById(id).getElementsByClassName(className)[0];
}

/**
 * Return true if critical assumptions made about the HTML code holds.
 */
function sanityCheckPassed()
{
    try
    {
        ensureElementExists("character");

        // Make sure we can get a correct storage key
        var parts = getStorageKey("meaning").split("_");
        if (parts.length != 3 || parts[0] == "" ||
            parts[1] == ""    || parts[2] == "")
        {
            throw new Error("Unable to generate a correct storage key: " + key);
        }

        if (isLesson())
        {
            ensureElementExists("main-info");
        }

        if (isQuiz())
        {
            ensureElementExists("all-info");
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
        }
        else // Lessons during learning
        {
            ensureElementExistsAndHasClass("supplement-voc-reading", "pure-u-3-4");
            ensureElementExistsAndHasClass("supplement-voc-meaning", "pure-u-3-4");
            ensureElementExistsAndHasClass("supplement-kan-reading", "pure-u-3-4");
            ensureElementExistsAndHasClass("supplement-kan-meaning", "pure-u-3-4");
            ensureElementExistsAndHasClass("supplement-rad-name", "pure-u-1");

            // Make sure assumptions in isQuiz() holds.
            var cn = document.getElementById("main-info").parentElement.className;
            if (cn != "" && cn != "quiz")
            {
                throw new Error("Parent of 'main-info' is neither empty nor \"quiz\"");
            }
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
 * @return the element if it exist
 */
function ensureElementExists(id)
{
    var element = document.getElementById(id);
    if (element == null)
    {
        throw new Error(id + " does not exist");
    }
    return element;
}

/**
 * Throws an exception if the given id doesn't exist in the DOM tree.
 */
function ensureElementExistsAndHasClass(id, className)
{
    var element = ensureElementExists(id);
    if (element.getElementsByClassName(className)[0] == null)
    {
        throw new Error(id + " does not contain any element with class: " + className);
    }
}
