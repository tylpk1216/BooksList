chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'new-read.readmoo.com'},
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'www.kobo.com'},
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'play.google.com'},
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});

