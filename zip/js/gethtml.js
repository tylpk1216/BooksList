var bookStores = [
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

function sendResponse(items) {
    chrome.runtime.sendMessage({
        action: "getSource",
        source: items,
        url: document.URL
    });
}

function showReadmooBooks(source) {
    let regex = /<div class=\"title\" title=\"(.*)\">/g;
    showBook(regex, source);
}

function showKoboBooks(source) {
    let regex = /<p class=\"title product-field.*>\n.*>(.*)</g;
    showBook(regex, source);
}

function showBook(regex, source) {
    let info;
    let items = [];
    while ((info = regex.exec(source)) != null) {
        items.push(info[1]);
    }

    sendResponse(items);
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
    let url = document.URL;
    let source = document.documentElement.innerHTML;

    for (let i = 0; i < bookStores.length; i++) {
        if (url.indexOf(bookStores[i].name) >= 0) {
            bookStores[i].func(source);
            return;
        }
    }

    sendResponse([]);
}

checkBookStore();