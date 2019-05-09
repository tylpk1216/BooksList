chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'new-read.readmoo.com', pathContains:'library'},
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'www.kobo.com', pathContains:'library'},
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'play.google.com', pathContains:'books'},
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});

