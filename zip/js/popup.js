const messageID = '#message';

let message = null;

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

function showMessage(items) {
    let msg = '';
    let index = 1;
    let strLen = 0;

    for (let i = 0; i < items.length; i++) {
        if (items[i].length > strLen) strLen = items[i].length;

        msg += getNumberString(3, index) + '\t\t\t' + items[i] + '\n';
        index++;
    }

    setMessage(strLen, msg);
}

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
        let items = request.source;
        showMessage(items);
    }
});

window.onload = onWindowLoad;