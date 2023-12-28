const {until, By, Key} = require("selenium-webdriver");
const fs = require("fs");

module.exports = class CartPage {
    constructor(driver, mainLink, cartLink) {
        this.driver = driver
        const config = (JSON.parse(fs.readFileSync('config.json').toString())).cartPageSelectors
        this.mainLink = mainLink
        this.cartLink = cartLink
        this.amountInputSelector = config.amountInputSelector
        this.cityInputSelector = config.cityInputSelector
        this.optionsWrapperSelector = config.optionsWrapperSelector
        this.elementInCartSelector = config.elementInCartSelector
        this.makeOrderButtonSelector = config.makeOrderButtonSelector
    }

    async setAmountValue(newValue) {
        await this.driver.get(this.cartLink);
        await this.driver.wait(until.elementLocated(By.css(this.amountInputSelector)));
        const input = await this.driver.findElement(By.css(this.amountInputSelector));
        await input.sendKeys(Key.DELETE, Key.DELETE, newValue);
    }

    async getAmountValue() {
        await this.driver.wait(until.elementLocated(By.css(this.amountInputSelector)));
        const input = await this.driver.findElement(By.css(this.amountInputSelector));
        return await input.getAttribute('value')
    }
    async setCityName(newName) {
        await this.driver.get(this.cartLink)
        await this.driver.wait(until.elementLocated(By.css(this.elementInCartSelector)))
        const makeOrderButton = this.driver.findElement(By.css(this.makeOrderButtonSelector))
        makeOrderButton.click()
        await this.driver.wait(until.elementLocated(By.css(this.cityInputSelector)))
        const cityInput = await this.driver.findElement(By.css(this.cityInputSelector))
        const initialCityName = await cityInput.getAttribute('value')
        await cityInput.sendKeys(newName)
        return initialCityName
    }
    async getCityName() {
        await this.driver.wait(until.elementLocated(By.css(this.cityInputSelector)))
        const cityInput = await this.driver.findElement(By.css(this.cityInputSelector))
        return await cityInput.getAttribute('value')
    }
    async getSearchResults() {
        try {
            await this.driver.wait(until.elementLocated(By.css(this.optionsWrapperSelector)), 5e3)
            const optionsWrapper = await this.driver.findElement(By.css(this.optionsWrapperSelector))
            return await optionsWrapper.getText()
        } catch(error) {
            return 'Результатов не найдено'
        }
    }
}