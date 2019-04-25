chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'new-read.readmoo.com'},
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            },
            {
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'www.kobo.com'},
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            },
            {
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'play.google.com'},
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});

