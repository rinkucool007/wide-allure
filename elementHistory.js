const fs = require('fs');

class ElementHistory {
    constructor() {
        this.historyFile = 'element_history.json';
        this.history = this.loadHistory();
    }

    loadHistory() {
        return fs.existsSync(this.historyFile) 
            ? JSON.parse(fs.readFileSync(this.historyFile))
            : {};
    }

    saveHistory() {
        fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
    }

    addElement(url, selector, timestamp) {
        if (!this.history[url]) {
            this.history[url] = [];
        }
        this.history[url].push({
            selector,
            timestamp,
            lastUsed: Date.now()
        });
        this.saveHistory();
    }

    getHistoricalSelectors(url) {
        return this.history[url] || [];
    }
}

module.exports = ElementHistory;