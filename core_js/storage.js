/*
* ClearURLs
* Copyright (c) 2017-2019 Kevin Röbert
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*jshint esversion: 6 */
/*
* This script is responsible for the storage.
*/
var storage = [];

/**
* Writes the storage variable to the disk.
*/
function saveOnExit()
{
    var json = {};

    Object.entries(storage).forEach(([key, value]) => {
        switch (key) {
            case "ClearURLsData":
            case "log":
            json[key] = JSON.stringify(value);
            break;
            case "types":
            json[key] = value.toString();
            break;
            default:
            json[key] = value;
        }
    });
    console.log(translate('core_save_on_disk'));
    browser.storage.local.set(json);
}

/**
* Save the value under the key on the disk.
* @param  {String} key
* @param  {Object} value
*/
function saveOnDisk(key, value)
{
    browser.storage.local.set({key: value});
}

/**
* Retrieve everything and save on the RAM.
*/
function getDataFromDisk()
{
    browser.storage.local.get(null).then(initStorage, error);
}

/**
* Return the value under the key.
* @param  {String} key
* @return {Object}
*/
function getData(key)
{
    return storage[key];
}

/**
* Return the entire storage object.
* @return {Object}
*/
function getEntireData()
{
    return storage;
}

/**
* Save the value under the key on the RAM.
* @param {String} key
* @param {Object} value
*/
function setData(key, value)
{
    switch (key) {
        case "ClearURLsData":
        case "log":
        storage[key] = JSON.parse(value);
        break;
        case "hashURL":
        case "ruleURL":
        storage[key] = replaceOldURLs(value);
        break;
        case "types":
        storage[key] = value.split(',');
        break;
        default:
        storage[key] = value;
    }
}

/**
* Write error on console.
*/
function error(e)
{
    console.log(translate('core_error'));
    console.error(e);
}

/**
* Set default values, if the storage is empty.
* @param  {Object} items
*/
function initStorage(items)
{
    initSettings();

    if(!isEmpty(items)) {
        Object.entries(items).forEach(([key, value]) => {
            setData(key, value);
        });
    }

    // Start the clearurls.js
    start();

    // Start the context_menu
    contextMenuStart();

    // Start history listener
    historyListenerStart();
}

/**
* Set default values for the settings.
*/
function initSettings()
{
    storage.ClearURLsData = [];
    storage.dataHash = "";
    storage.badgedStatus = true;
    storage.globalStatus = true;
    storage.globalurlcounter = 0;
    storage.globalCounter = 0;
    storage.hashStatus = "error";
    storage.loggingStatus = false;
    storage.log = {"log": []};
    storage.statisticsStatus = true;
    storage.badged_color = "ffa500";
    storage.hashURL = "https://gitlab.com/KevinRoebert/ClearUrls/-/jobs/artifacts/master/raw/rules.min.hash?job=hash%20rules";
    storage.ruleURL = "https://gitlab.com/KevinRoebert/ClearUrls/raw/master/data/data.min.json";
    storage.contextMenuEnabled = true;
    storage.historyListenerEnabled = true;
    storage.localHostsSkipping = true;

    if(getBrowser() === "Firefox") {
        storage.types = ["font", "image", "imageset", "main_frame", "media", "object", "object_subrequest", "other", "script", "stylesheet", "sub_frame", "websocket", "xbl", "xml_dtd", "xmlhttprequest", "xslt"];
    } else if (getBrowser() === "Chrome") {
        storage.types = ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"];
    }
}

/**
* Replace the old URLs with the
* new GitLab URLs.
*/
function replaceOldURLs(url)
{
    switch (url) {
        case "https://raw.githubusercontent.com/KevinRoebert/ClearUrls/master/data/rules.hash?flush_cache=true":
        return "https://gitlab.com/KevinRoebert/ClearUrls/-/jobs/artifacts/master/raw/rules.min.hash?job=hash%20rules";
        case "https://raw.githubusercontent.com/KevinRoebert/ClearUrls/master/data/data.json?flush_cache=true":
        return "https://gitlab.com/KevinRoebert/ClearUrls/raw/master/data/data.min.json";
        case "https://gitlab.com/KevinRoebert/ClearUrls/raw/master/data/rules.hash":
        return "https://gitlab.com/KevinRoebert/ClearUrls/-/jobs/artifacts/master/raw/rules.min.hash?job=hash%20rules";
        case "https://gitlab.com/KevinRoebert/ClearUrls/raw/master/data/data.json":
        return "https://gitlab.com/KevinRoebert/ClearUrls/raw/master/data/data.min.json";
        default:
        return url;
    }
}

/**
* Load local saved data, if the browser is offline or
* some other network trouble.
*/
function loadOldDataFromStore()
{
    localDataHash = storage.dataHash;
}

/**
* Save the hash status to the local storage.
* The status can have the following values:
*  1 "up to date"
*  2 "updated"
*  3 "update available"
*  @param status_code the number for the status
*/
function storeHashStatus(status_code)
{
    switch(status_code)
    {
        case 1: status_code = "hash_status_code_1";
        break;
        case 2: status_code = "hash_status_code_2";
        break;
        case 3: status_code = "hash_status_code_3";
        break;
        default: status_code = "hash_status_code_4";
    }

    storage.hashStatus = status_code;
}

/**
* Save every minute the temporary data to the disk.
*/
setInterval(saveOnExit, 60000);

// Start storage
getDataFromDisk();
