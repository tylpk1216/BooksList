const messageID = '#message';

let message = null;

let bookStores = [
    {
        name: 'readmoo',
        func: showReadmooBooks
    },
    {
        name: 'kobo',
        func: showKoboBooks
    },
    {
        name: 'google',
        func: showGoogleBooks
    }
];

function setMessage(strLen, msg) {
    if (message) {
        message.style.width = strLen * 15 + 'px';
        message.innerText = msg;
    }
}

function getNumberString(len, index) {
    let s = index.toString();

    let max = len;
    if (max < 3) max = 3;

    for (let i = s.length; i < max; i++) {
        s = '0' + s;
    }

    return s;
}

function showBook(regex, source) {
    let info;
    let msg = '';
    let index = 1;
    let strLen = 0;
    while ((info = regex.exec(source)) != null) {
        if (info[1].length > strLen) strLen = info[1].length;

        msg += getNumberString(3, index) + '\t\t\t' + info[1] + '\n';
        index++;
    }

    setMessage(strLen, msg);
}

function showReadmooBooks(source) {
    let regex = /<div class=\"title\" title=\"(.*)\">/g;
    showBook(regex, source);
}

function showKoboBooks(source) {
    let regex = /<p class=\"title product-field.*>\n.*>(.*)</g;
    showBook(regex, source);
}

function showGoogleBooks(source) {
    let startPattern = 'href="/books/reader?id=';
    let namePattern = 'title="';

    let newSource = '';
    while (true) {
        let i = source.indexOf(startPattern);
        if (i === -1) break;

        source = source.slice(i + startPattern.length);

        let next_i = source.indexOf(namePattern);
        if (next_i === -1) break;

        source = source.slice(next_i + namePattern.length);

        let last_i = source.indexOf('"');
        if (last_i === -1) break;

        let name = source.slice(0, last_i);
        newSource += name + '\n';

        source = source.slice(last_i + newSource.length + 1);

        // some books need to be adjusted
        let extraPattern = '> ' + name;
        let extra_i = source.indexOf(extraPattern);
        if (extra_i !== -1) {
            source = source.slice(extra_i + extraPattern.length);
        }
    }

    let regex = /(.*)\n/g;
    showBook(regex, newSource);
}

function onWindowLoad() {
    message = document.querySelector(messageID);
    chrome.tabs.executeScript(null, {
        file: "js/gethtml.js"
    }, function() {
        if (chrome.runtime.lastError) {
            let errorMsg = chrome.runtime.lastError.message;
            message.innerText = 'error : \n' + errorMsg;
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
        for (let i = 0; i < bookStores.length; i++) {
            if (request.url.indexOf(bookStores[i].name) >= 0) {
                bookStores[i].func(request.source);
                return;
            }
        }
        message.innerText = 'not supported yet';
    }
});

window.onload = onWindowLoad;