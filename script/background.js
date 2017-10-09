let domains = [];
let detectedDomains = [];
const blacklist = 'https://raw.githubusercontent.com/Shaa3/nominers/master/assets/filter.txt';

const getRootDomain = (url) => {
    const match = url.match(/:\/\/(.[^/]+)/);
    return match ? match[1] : '';
};

function updateBadge(scriptCount, tabId) {
    browser.browserAction.setBadgeBackgroundColor({
        color: (scriptCount == 0) ? [16, 201, 33, 100] : [200, 0, 0, 100],
        tabId: tabId
    });

    browser.browserAction.setBadgeText({
        text: String(scriptCount),
        tabId: tabId
    });
}

const runBlocker = (blacklist) => {
    const blacklistedUrls = blacklist.split('\n');
    browser.webRequest.onBeforeRequest.addListener(details => {
        browser.browserAction.setBadgeBackgroundColor({ //set badge color
            color: [200, 0, 0, 100],
            tabId: details.tabId
        });

        browser.browserAction.setBadgeText({ //set badge text
            text: '!',
            tabId: details.tabId
        });

        detectedDomains[details.tabId] = true;

        browser.browserAction.setIcon({
            path: ASSET.iconBlocked,
            tabId: details.tabId,
        });

        console.log("Blocking!");
        return {cancel: true};
    }, {
        urls: blacklistedUrls
    }, ['blocking']);
};

const useLocalBlocker = () => {
    fetch(browser.runtime.getURL(ASSET.filter))
        .then(resp => {
            resp.text().then(text => runBlocker(text));
        }).catch(resp => {
        console.log("Error reading local filter.txt: " + resp.text());
    });
};

/***
 * Listeners
 */
function handleUpdateListener(tabId, changeInfo, tabInfo) {
    if (changeInfo.url) {
        //console.log("Tab: " + tabId + " URL changed to " + changeInfo.url);

        domains[tabId] = getRootDomain(tabInfo.url);
        detectedDomains[tabInfo.tabId] = false;

        browser.browserAction.setIcon({path: ASSET.iconEnabled, tabId});
        browser.browserAction.setBadgeText({text: '', tabId});
    }
}

function handleTabRemovedListener(tabId) {
    if (tabId in domains) {
        delete domains[tabId];
    }
}

function initListeners() {
    var p = Promise.race([
        fetch(blacklist),
        new Promise(function (resolve, reject) {
            setTimeout(() => reject(new Error('request timeout')), 7000)
        })
    ])
    p.then(resp => {
        if (resp.status !== 200) {
            throw 'HTTP Error: ' + resp.status;
        }

        resp.text().then((text) => {
            if (text === '') {
                throw 'Empty response';
            }

            runBlocker(text);
            console.log("NoMiners: Blocker running");
        });
    }).catch(error => {
        console.log(error)
        console.log("Using local filter.txt");
        useLocalBlocker();
    });

    if (browser.tabs.onUpdated.hasListener(handleUpdateListener)) {
        browser.tabs.onUpdated.removeListener(handleUpdateListener);
    }

    if (browser.tabs.onRemoved.hasListener(handleTabRemovedListener)) {
        browser.tabs.onRemoved.removeListener(handleTabRemovedListener);
    }

    browser.tabs.onUpdated.addListener(handleUpdateListener);
    browser.tabs.onRemoved.addListener(handleTabRemovedListener);

    console.log("INIT");
}

initListeners();