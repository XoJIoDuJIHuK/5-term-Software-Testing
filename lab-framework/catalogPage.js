const {By, until, Key} = require("selenium-webdriver")
const fs = require("fs")

module.exports = class CatalogPage {
    constructor(driver, mainLink, cartLink) {
        this.cartLink = cartLink
        this.mainLink = mainLink
        this.driver = driver;
        const config = (JSON.parse(fs.readFileSync('config.json').toString())).catalogPageSelectors
        this.filterCheckboxItems = config.filterCheckboxItems
        this.manufacturerCheckboxText = config.manufacturerCheckboxText
        this.productTitles = config.productTitles
        this.firstProductSelector = config.firstProductSelector
        this.addToCartButtonSelector = config.addToCartButtonSelector
        this.selectedMethodSelector = config.selectedMethodSelector
        this.mostExpensiveSelector = config.mostExpensiveSelector
        this.goodPriceSelector = config.goodPriceSelector
        this.socialLinkSelector = config.socialLinkSelector
        this.amountInput = config.amountInput
    }

    async open() {
        await this.driver.get(this.mainLink);

        await this.driver.wait(until.elementsLocated(By.css(this.filterCheckboxItems)), 10e3);
    }

    async filterByManufacturer(textToFind) {
        const labels = await this.driver.findElements(this.filterCheckboxItems);
        for (let label of labels) {
            const manufacturer = await label.findElement(this.manufacturerCheckboxText);
            const innerText = await manufacturer.getText();
            if (innerText === textToFind) {
                await this.driver.executeScript("arguments[0].click()", label);
                await this.driver.sleep(1e3);
                break;
            }
        }
        await this.driver.wait(until.elementsLocated(By.className('schema-product')), 10e3);
    }

    async getProductTitles() {
        return await this.driver.findElements(this.productTitles);
    }
    async openProductDetails() {
        if (await this.driver.getCurrentUrl() !== this.mainLink) {
            await this.driver.get(this.mainLink)
        }
        await this.driver.wait(until.elementLocated(By.css(this.firstProductSelector)))
        const firstProductLink = await this.driver.findElement(By.css(this.firstProductSelector));
        await this.driver.get(firstProductLink.getAttribute('href'));
    }

    async addToCart() {
        await this.driver.wait(until.elementLocated(By.css(this.addToCartButtonSelector)));
        const addToCartButton = await this.driver.findElement(By.css(this.addToCartButtonSelector));
        addToCartButton.click();
        await this.driver.sleep(2e3);
        await this.driver.get(this.cartLink);
        await this.driver.wait(until.elementLocated(By.css('div.cart-form__offers-list')), 5e3);
    }

    async setInputValue(newValue) {
        const input = await this.driver.findElement(By.css(this.amountInput));
        await input.sendKeys(Key.DELETE, Key.DELETE, newValue);
        if (await input.getAttribute('value') === newValue) {
            throw new Error(`новое значение равняется ${newValue}, так нельзя`);
        }
    }
    async setSortingOrderToPriceDescending() {
        await this.driver.get(this.mainLink)
        await this.driver.wait(until.elementLocated(By.css(this.selectedMethodSelector)))
        const selectedMethodElement = await this.driver.findElement(By.css(this.selectedMethodSelector))
        await selectedMethodElement.click()
        await this.driver.sleep(1e3)
        const mostExpensiveElement = await this.driver.findElement((By.css(this.mostExpensiveSelector)))
        await mostExpensiveElement.click()
    }
    async getStringPricesArray() {
        const priceElements = await this.driver.findElements((By.css(this.goodPriceSelector)))
        let pricesArray = []
        for (const e of priceElements) {
            const price = await e.getText();
            pricesArray.push(price.slice(price));
        }
        return pricesArray
    }
    async vkLinkCheck() {
        await this.driver.get(this.mainLink)
        await this.driver.wait(until.elementLocated(By.css(this.socialLinkSelector)), 20e3)
        const socialLink = await this.driver.findElement(By.css(this.socialLinkSelector))
        const expectedHref = await socialLink.getAttribute('href')
        await this.driver.get(expectedHref)
        await this.driver.wait(until.elementLocated(By.tagName('body')), 5e3)
        return expectedHref
    }
}