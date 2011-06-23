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

function log(msg)
{
    if(window.console) window.console.log(msg);
    if(GM_log) GM_log(msg);
}

function matchesHideCriteria(game)
{
    var cells = game.children("td");

    // If there's something in the "subscription pay" column.
    var payImgs = cells.filter(".pay.alt").children("img");
    if(payImgs.length >= 3 && payImgs.eq(2).attr("src").indexOf("blank") == -1)
        return true;

    // If the "status" column is undesirable.
    var devImgs = cells.filter(".status.name.first").children("img");
    if(devImgs.length >= 1 && devImgs.eq(0).attr("title") == "Development")
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

