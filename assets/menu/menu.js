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
        "title": reportNotificationTitle,
        "message": reportNotificationMessage
    });

    //sending needs to be implemented - aint importent now [TODO]


    browser.tabs.query({active:true,currentWindow:true}).then(function(tabs){
        var currentTabUrl = tabs[0].url;
        var http = getXMLHttp();

        http.open("POST", "https://localhost/report?url=" + currentTabUrl, true);
        http.send(null);
    }, onError);

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

/***
 * Internationalization
 */

var s0 = browser.i18n.getMessage("menuSettings");
var r1 = browser.i18n.getMessage("menuReport");
var r2 = browser.i18n.getMessage("menuReload");
var reportNotificationTitle = browser.i18n.getMessage("reportNotiTitle");
var reportNotificationMessage = browser.i18n.getMessage("reportNotiDescription");

function changeElementText(id, text){
    var fieldNameElement = document.getElementById(id);
    while(fieldNameElement.childNodes.length >= 1) {
        fieldNameElement.removeChild(fieldNameElement.firstChild);
    }
    fieldNameElement.appendChild(fieldNameElement.ownerDocument.createTextNode(text));
}

function loadInternationalization() {
    changeElementText(0, s0);
    changeElementText(1, r1);
    changeElementText(2, r2);
}

function getXMLHttp(){
    try {
        return XPCNativeWrapper(new window.wrappedJSObject.XMLHttpRequest());
    }
    catch(evt){
        return new XMLHttpRequest();
    }
}

loadInternationalization();