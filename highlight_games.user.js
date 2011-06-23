// ==UserScript==
// @name            Highlight games
// @include         http://www.mmorpg.com/gamelist.cfm
// @include         http://www.mmorpg.com/gamelist.cfm/*
// ==/UserScript==

if(unsafeWindow)
{
    $ = unsafeWindow.$;
    setInterval = unsafeWindow.setInterval;
    clearInterval = unsafeWindow.clearInterval;
    window = unsafeWindow;
}

// TODO: Put these in local storage.
// TODO: Have an interface for changing these.
var badStatuses = ["development"];
var badGenres = ["historical", "real life", "sports"];
var badNames = [];

// Log `msg` to whatever logging facilities are available.
function log(msg)
{
    if(window.console) window.console.log(msg);
    if(GM_log) GM_log(msg);
}

// Returns true iff `elem` is in `array`.
function matchesAny(elem, array, match)
{
    if(match == undefined)
        match = function(a, b) { return a == b; }

    for(x in array)
        if(match(elem, array[x]))
            return true;

    return false;
}

function matchesHideCriteria(game)
{
    var cells = game.children("td");

    // If the genre is undesirable.
    if(matchesAny(cells.filter(".genre").html().toLowerCase(), badGenres))
        return true;

    // If the name is undesirable;
    if(matchesAny(cells.find("a").html().toLowerCase(), badNames))
        return true;

    // If there's something in the "subscription pay" column.
    var payImgs = cells.filter(".pay.alt").children("img");
    if(payImgs.length >= 3 && payImgs.eq(2).attr("src").indexOf("blank") == -1)
        return true;

    // If the game's status is undesirable.
    var devImgs = cells.filter(".status.name.first").children("img");
    if(devImgs.length >= 1 && matchesAny(devImgs.eq(0).attr("title").toLowerCase(), badStatuses))
        return true;

    return false;
}

function matchesHighlightCriteria(game)
{
    return true;
}

function highlightText(text)
{
    text.css("font-weight", "bold");
}

function handleRow(row)
{
    // If it's just a filler row, exit.
    if(row.attr("id").substr(0, 6) != "glrow_")
        return;

    if(matchesHideCriteria(row))
        row.hide();
    else if(matchesHighlightCriteria(row))
        highlightText(row.children("td").eq(1).closest("a"));
}

function highlightGameList()
{
    var games = $("#gamelisttable > tbody > tr");

    for(var i = 0; i < games.length; ++i)
        handleRow(games.eq(i));
}

$(document).ready(highlightGameList);

