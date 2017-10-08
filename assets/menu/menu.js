function logTabs(windowInfo) {
    var reportedUrls = [];
    var x = 0;
    for (tabInfo of windowInfo.tabs) {
        reportedUrls[x] = tabInfo.url;
        x++;
    }
    //console.log(reportedUrls);

    browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("assets/icons/icon_blocked.svg"),
        "title": "Thank you for reporting the website!",
        "message": "Information about the website was transmitted.\n We will try to block the javascript-miner from this webpage as soon as possible."
    });

    //sending needs to be implemented - aint importent now [TODO]
}

function onError(error) {
    console.log(`Error: ${error}`);
}


document.addEventListener("click", (e) => {
    if (e.target.classList.contains("settings")) {
        browser.runtime.openOptionsPage();
    } else if (e.target.classList.contains("report")) {
        var getting = browser.windows.getCurrent({populate: true});
        getting.then(logTabs, onError);
    } else if (e.target.classList.contains("clear")) {
        browser.tabs.reload();
        window.close();
    }
});