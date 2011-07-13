// ==UserScript==
// @name            MMORPG Game Filter
// @include         http://www.mmorpg.com/gamelist.cfm
// @description     Adds more filtering functionality to the MMORPG.com gamelist.
// ==/UserScript==

if(unsafeWindow)
{
    $ = unsafeWindow.$;
    window = unsafeWindow;
}

// Temporary storage of items, with the same interface as `window.localStorage`.
function TempStorage()
{
    this.getItem = function(key)
    {
        return storedItems[key];
    }

    this.setItem = function(key, value)
    {
        storedItems[key] = value;
    }

    this.removeItem = function(key)
    {
        this.setItem(key, undefined);
    }

    var storedItems = {};
}

function FilterSet(storage)
{
    // TODO: Have an interface to settings these members.
    
    function getStorageArray(name)
    {
        var text = storage.getItem(name);

        if(text)
            return text.split(",");

        return [];
    }

    function setStorageArray(name, array)
    {
        storage.setItem(name, array.toString());
    }

    this.getBadStatuses = function()
    {
        return getStorageArray("badStatuses");
    }

    this.setBadStatuses = function(badStatuses)
    {
        setStorageArray("badStatuses", badStatuses);
    }

    this.getGoodGames = function()
    {
        return getStorageArray("goodGames");
    }

    this.setGoodGames = function(goodGames)
    {
        setStorageArray("goodGames", goodGames);
    }

    this.getBadGenres = function()
    {
        return getStorageArray("badGenres");
    }

    this.setBadGenres = function(badGenres)
    {
        setStorageArray("badGenres", badGenres);
    }

    this.getBadGames = function()
    {
        return getStorageArray("badGames");
    }

    this.setBadGames = function(badGames)
    {
        setStorageArray("badGames", badGames);
    }

    this.getBadColumns = function()
    {
        return getStorageArray("badColumns");
    }

    this.setBadColumns = function(badColumns)
    {
        setStorageArray("badColumns", badColumns);
    }
}

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

// Check if `a` matches `b`, case insensitive.
function stringMatch(a, b)
{
    return a.substr(0, 26).toLowerCase() == b.substr(0, 26).toLowerCase();
}

function matchesHideCriteria(game, filters)
{
    // If it's just a filler row, not a game row.
    if(game.attr("id").substr(0, 6) != "glrow_")
        return true;

    var cells = game.children("td");

    // If the genre is undesirable.
    if(matchesAny(cells.filter(".genre").html().toLowerCase(), filters.getBadGenres(), stringMatch))
        return true;

    // If the name is undesirable.
    if(matchesAny(cells.find("a").html().toLowerCase(), filters.getBadGames(), stringMatch))
        return true;

    // If it's not marked as free.
    var payImgs = cells.filter(".pay.alt").children("img");
    if(payImgs.length >= 1 && payImgs.eq(0).attr("src").indexOf("blank") != -1)
        return true;

    // If the game's status is undesirable.
    var devImgs = cells.filter(".status.name.first").children("img");
    if(devImgs.length >= 1 && matchesAny(devImgs.eq(0).attr("title").toLowerCase(), filters.getBadStatuses(), stringMatch))
        return true;

    return false;
}

function matchesHighlightCriteria(game, filters)
{
    var name = game.children("td").eq(1).children("a").html();
    return !matchesAny(name, filters.getGoodGames(), stringMatch);
}

function highlightRow(row)
{
    row.css("font-weight", "bold");
    var cells = row.children("td");
    cells.css("color", "cyan");
    cells.eq(1).children("a").css("color", "cyan");
}

// Hide all indices in JQuery collection `array` which are in `indices`.
function hideIndices(array, indices)
{
    for(var i = 0; i < indices.length; ++i)
        array.eq(indices[i]).hide();
}

// TODO: Clear out all unused filter elements (e.g. duplicate games).
function fixGameList(filters)
{
    var badColumns = filters.getBadColumns();

    hideIndices($("#gamelisttable > thead > tr > th"), badColumns);

    var games = $("#gamelisttable > tbody > tr");

    for(var i = 0; i < games.length; ++i)
    {
        var row = games.eq(i);

        if(matchesHideCriteria(row, filters))
            row.hide();
        else
        {
            hideIndices(row.children("td"), badColumns);

            if(matchesHighlightCriteria(row, filters))
                highlightRow(row);
        }
    }
}

$(document).ready(function()
    {
        var filters;

        if(window.localStorage == undefined)
        {
            log("Error: Browser support for HTML5 local storage is not enabled.");
            filters = new FilterSet(new TemporaryStorage);
        }
        else
            filters = new FilterSet(window.localStorage);

        log("Loading bad games list: " + filters.getBadGames().sort());
        log("Loading bad genres list: " + filters.getBadGenres().sort());
        log("Loading bad statuses list: " + filters.getBadStatuses().sort());
        log("Loading good games list: " + filters.getGoodGames().sort());

        fixGameList(filters);
    }
);

