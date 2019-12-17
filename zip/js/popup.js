const messageID = '#message';
const loadingImgID = '#loading';
const progressBarID = '#progressbar';

let $messagePanel = null;
let $loadingImg = null;
let $progressBar = null;

function setMessage(strLen, msg) {
    if ($messagePanel) {
        $messagePanel.css('width', (strLen * 15).toString() + 'px');
        $messagePanel.text(msg);
    }

    disableLoadingImg(true);
    $progressBar.text('');
}

function disableLoadingImg(status) {
    if (status) {
        $loadingImg.hide();
    } else {
        $loadingImg.show();
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
    $messagePanel = $(messageID);
    $loadingImg = $(loadingImgID);
    $progressBar = $(progressBarID);

    disableLoadingImg(false);

    chrome.tabs.executeScript(null, {
        file: "js/jquery.min.js"
    }, function() {
        if (chrome.runtime.lastError) {
            let errorMsg = chrome.runtime.lastError.message;
            setMessage(errorMsg.length, errorMsg);
            return;
        }

        chrome.tabs.executeScript(null, {
            file: "js/xlsx.full.min.js"
        }, function() {
            if (chrome.runtime.lastError) {
                let errorMsg = chrome.runtime.lastError.message;
                setMessage(errorMsg.length, errorMsg);
            }

            chrome.tabs.executeScript(null, {
                file: "js/gethtml.js"
            }, function() {
                if (chrome.runtime.lastError) {
                    let errorMsg = chrome.runtime.lastError.message;
                    setMessage(errorMsg.length, errorMsg);
                }
            });
        });
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
    if (request.action == "getBooks") {
        if (!Array.isArray(request.source)) {
            setMessage(request.source.length, request.source);
            return;
        }

        let items = request.source;
        showMessage(items);
    } else if (request.action == 'progressMsg') {
        $progressBar.text(request.source);
    }
});

window.onload = onWindowLoad;