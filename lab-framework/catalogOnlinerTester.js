const {Builder} = require("selenium-webdriver");
const {StaleElementReferenceError, NoSuchElementError, TimeoutError} = require("selenium-webdriver/lib/error");
const CatalogPage = require("./catalogPage");
const CartPage = require("./cartPage");
const DriverManager = require("./driverManager");
const log4js = require("log4js")
log4js.configure('log4js.json')
const logger = log4js.getLogger()

module.exports = class CatalogOnlinerTester {
    constructor(config) {
        this.driver = DriverManager.getDriver();
        this.catalogPage = new CatalogPage(this.driver, config.mainLink, config.cartLink);
        this.cartPage = new CartPage(this.driver, config.mainLink, config.cartLink)

    }

    async filterByManufacturer(textToFind) {
        try {
            await this.catalogPage.open();
            await this.catalogPage.filterByManufacturer(textToFind);

            const productTitles = await this.catalogPage.getProductTitles();
            for (let i = 0; i < productTitles.length; i++) {
                try {
                    const titleText = await productTitles[i].getText();
                    logger.info(`Checking product ${titleText}`)
                    if (!titleText.includes(textToFind)) {
                        throw new Error(`the good must not be here - ${titleText}`);
                    }
                    logger.info(`Product ${titleText} passed`)
                } catch (error) {
                    if (error instanceof StaleElementReferenceError) {
                        const refreshedProductTitles = await this.catalogPage.getProductTitles();
                        productTitles[i] = refreshedProductTitles[i];
                        i--;
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error('Test error: ', error);
            return false;
        }
        return true;
    }
    async sortByPrice() {
        await this.catalogPage.setSortingOrderToPriceDescending()
        await this.driver.sleep(5e3)
        const stringPricesArray = await this.catalogPage.getStringPricesArray()
        const numericArray = stringPricesArray.map(str =>
            parseFloat(str.replace(/[^\d.,]/g, '').replace(',', '.')));
        logger.info(`Numeric prices array: ${numericArray}`)
        for (let i = 0; i < numericArray.length - 1; i++) {
            if (numericArray[i] < numericArray[i + 1]) {
                console.log(numericArray[i])
                return false;
            }
        }

        return true;
    }
    async addGoodToCart() {
        try {
            await this.catalogPage.openProductDetails()
            await this.catalogPage.addToCart()
            return true;
        } catch (error) {
            console.error('Test error:', error);
            return false;
        }
    }

    async setInputValue(newValue) {
        try {
            await this.cartPage.setAmountValue(newValue)
            logger.info(`Trying to set product amount to ${newValue}`)
            if (await this.cartPage.getAmountValue() === newValue) {
                throw new Error(`new value equals ${newValue}, it mustn't be so`);
            }
            return true;
        } catch (error) {
            console.error('Test error:', error);
            return false;
        }
    }

    async setCityName(newName) {
        let initialName
        try {
            logger.info(`Trying to set city name to ${newName}`)
            initialName = await this.cartPage.setCityName(newName)
            await this.driver.sleep(4e3)
            const searchResults = await this.cartPage.getSearchResults()
            return searchResults === 'Результатов не найдено';

        } catch (error) {
            const finalCityName = await this.cartPage.getCityName()
            if ((error instanceof NoSuchElementError || error instanceof TimeoutError) &&
                finalCityName === initialName) {
                return true
            }
            console.error('Test error:', error);
            return false;
        }
    }
    async vkLinkCheck() {
        try {
            const expectedHref = await this.catalogPage.vkLinkCheck()
            const providedUrl = await this.driver.getCurrentUrl()
            if (expectedHref !== providedUrl) {
                throw new Error(`expected ${expectedHref} provided ${providedUrl}`)
            }
        } catch (error) {
            console.error('Test error:', error);
            return false;
        }
        return true
    }
}