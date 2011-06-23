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
var badGenres = ["Historical", "Real Life", "Sports"];
var badNames = ["Fiesta Online"];

function log(msg)
{
    if(window.console) window.console.log(msg);
    if(GM_log) GM_log(msg);
}

function matchesHideCriteria(game)
{
    var cells = game.children("td");

    // If the genre is undesirable.
    var genre = cells.filter(".genre").html();
    for(badGenre in badGenres)
        if(badGenres[badGenre].toLowerCase() == genre.toLowerCase())
            return true;

    // If the name is undesirable;
    var name = cells.find("a").html();
    for(badName in badNames)
        if(badNames[badName].toLowerCase() == name.toLowerCase())
            return true;

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

