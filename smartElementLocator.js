const { SevereServiceError } = require('webdriverio');
const ElementHistory = require('./elementHistory');
const allureReporter = require('@wdio/allure-reporter').default;

class SmartElementLocator {
    constructor() {
        this.history = new ElementHistory();
        this.locatorStrategies = [
            { type: 'id', fn: (id) => $(`#${id}`) },
            { type: 'xpath', fn: (text) => $(`//*[contains(text(), '${text}')]`)},
            { type: 'css', fn: (text) => $(`[title*='${text}'], [value*='${text}']`) },
            { type: 'class', fn: (className) => $(`.${className}`) }
        ];
    }

    async findElement(identifier, url = browser.getUrl()) {
        const historicalSelectors = this.history.getHistoricalSelectors(url);
        
        for (const entry of historicalSelectors.reverse()) {
            try {
                const element = await $(entry.selector);
                if (await element.isExisting()) {
                    await this.attachScreenshot(`Historical selector success: ${entry.selector}`);
                    return element;
                }
            } catch (e) {
                await this.attachScreenshot(`Historical selector failed: ${entry.selector}`);
            }
        }

        for (const strategy of this.locatorStrategies) {
            try {
                const element = await strategy.fn(identifier);
                if (await element.isExisting()) {
                    await this.history.addElement(url, element.selector, Date.now());
                    await this.attachScreenshot(`${strategy.type} strategy success`);
                    return element;
                }
            } catch (e) {
                await this.attachScreenshot(`${strategy.type} strategy failed`);
            }
        }

        await this.attachScreenshot('Element location failed');
        throw new SevereServiceError(`Could not locate element: ${identifier}`);
    }

    async attachScreenshot(name) {
        const screenshot = await browser.takeScreenshot();
        allureReporter.addAttachment(name, Buffer.from(screenshot, 'base64'), 'image/png');
    }
}

module.exports = SmartElementLocator;