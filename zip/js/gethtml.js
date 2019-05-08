var bookStores = [
    {
        name: 'readmoo',
        func: processReadmoo
    },
    {
        name: 'kobo',
        func: processKobo
    },
    {
        name: 'google',
        func: showGoogleBooks
    }
];

var items = [];
var actionCount = 0;
var actions = [];

function sendBooksMessage(items) {
    chrome.runtime.sendMessage({
        action: "getBooks",
        source: items,
        url: document.URL
    });
}

function sendProgressMessage(msg) {
    chrome.runtime.sendMessage({
        action: "progressMsg",
        source: msg,
        url: document.URL
    });
}

function getHTTPData(action, callback) {
    sendProgressMessage('progress : ' + actionCount + ' / ' + actions.length);

    $.ajax({
        url: action.url,
        type: action.method,
        timeout: 60000,
        processData: false,
        contentType: false,
        success: function(data, result) {
            callback(data, result);
        },
        error: function(xhr, textStatus, message) {
            sendBooksMessage(message);
        }
    });
}

/* ----------------- Readmoo ----------------- */
function getReadmooBookCount(source) {
    let totalCount = 0;

    // <span class="count">(<span class="num">50</span>)</span>;
    let regex = /<span class=\"num\">(\d+)<\/span>/g;
    let info = regex.exec(source);

    if (info != null) {
        totalCount = parseInt(info[1]);
    }

    return totalCount;
}

function processReadmoo(source) {
    let totalCount = getReadmooBookCount(source);

    let max = 48;
    let index = 0;
    let stop = false;
    while (!stop) {
        if (totalCount < max) {
            stop = true;
        }

        let url = '';
        if (index == 0) {
            url = 'https://new-read.readmoo.com/api/me/library/books?keyword=&state=&privacy=&sort=&count=' + max.toString() + '&archive=false';
        } else {
            url = 'https://new-read.readmoo.com/api/me/library/books?keyword=&state=&privacy=&sort=&count=' + max.toString() + '&archive=false&offset=' + (index * max).toString();
        }

        actions.push({
            method: 'GET',
            url: url
        });

        index++;
        totalCount -= max;
    }

    if (actions.length > 0) {
        getHTTPData(actions[actionCount], parseReadmooResponse);
        return;
    }

    sendBookResponse('parse readmoo data error');
}

function parseReadmooResponse(data, result) {
    if (!data || !data.included || data.status != 200) {
        sendBooksMessage('readmoo responses no data');
        return;
    }

    for (let i = 0; i < data.included.length; i++) {
        let item = data.included[i];
        if (!item.own) break;
        items.push(item.title);
    }

    actionCount++;
    if (actionCount == actions.length) {
        sendBooksMessage(items);
        return;
    }

    // next action
    getHTTPData(actions[actionCount], parseReadmooResponse);
}

// old way
function showReadmooBooks(source) {
    let regex = /<div class=\"title\" title=\"(.*)\">/g;
    showBook(regex, source);
}

/* ----------------- Kobo ----------------- */
function getKoboBookArg(source) {
    // <a href="/tw/zh/library?filter=All&pageSize=24&pageNumber=2" class="page-link final" data-track-info="{&quot;description&quot;:&quot;goToPage2&quot;}" translate="no">2</a>
    let regex = /pageSize=(\d+)&amp;pageNumber=(\d+).*class=\"page-link final/g;

    let info = regex.exec(source);
    if (info != null) {
        return {
            pageSize: parseInt(info[1]),
            pageNumber: parseInt(info[2])
        };
    }

    return null;
}

function parseKoboResponse(data, result) {
    // <img class="cover-image notranslate_alt" alt="xxxx" title="xxxxx"
    let regex = /<img class=\"cover-image notranslate_alt\" alt=\".*\" title=\"(.*)\" aria-hidden=\"true\"/g;

    let info;
    while ((info = regex.exec(data)) != null) {
        items.push(info[1]);
    }

    actionCount++;
    if (actionCount == actions.length) {
        sendBooksMessage(items);
        return;
    }

    // next action
    getHTTPData(actions[actionCount], parseKoboResponse);
}

function processKobo(source) {
    let koboArg = getKoboBookArg(source);

    if (koboArg === null) {
        // only one page?
        showKoboBooks(source);
        return;
    }

    for (let i = 1; i <= koboArg.pageNumber; i++) {
        let url = '/tw/zh/library?filter=All&pageSize=' + koboArg.pageSize.toString() + '&pageNumber=' + i.toString();

        actions.push({
            method: 'GET',
            url: url
        });
    }

    if (actions.length > 0) {
        getHTTPData(actions[0], parseKoboResponse);
        return;
    }

    sendBooksMessage('no kobo data');
}

// old way
function showKoboBooks(source) {
    let regex = /<p class=\"title product-field.*>\n.*>(.*)</g;
    showBook(regex, source);
}

/* ----------------- Google Play ----------------- */
function showBook(regex, source) {
    let info;
    let items = [];
    while ((info = regex.exec(source)) != null) {
        items.push(info[1]);
    }

    sendBooksMessage(items);
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

function checkBookStore() {
    items = [];
    actionCount = 0;
    actions = [];

    let url = document.URL;
    let source = document.documentElement.innerHTML;

    for (let i = 0; i < bookStores.length; i++) {
        if (url.indexOf(bookStores[i].name) >= 0) {
            bookStores[i].func(source);
            return;
        }
    }

    sendBooksMessage('not support yet');
}

checkBookStore();