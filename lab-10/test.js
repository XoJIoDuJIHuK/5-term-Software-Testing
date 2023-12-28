const { Builder, By, until, Key} = require("selenium-webdriver");
const { StaleElementReferenceError, NoSuchElementError, TimeoutError} = require("selenium-webdriver/lib/error");
const { expect } = require('@jest/globals');
const link = 'https://catalog.onliner.by/videocard';
const cartLink = 'https://cart.onliner.by';
const orderLink = 'https://cart.onliner.by/order';

class CatalogPage {
    constructor(driver) {
        this.driver = driver;
        this.filterCheckboxItems = By.css('label.schema-filter__checkbox-item');
        this.manufacturerCheckboxText = By.css('span.schema-filter__checkbox-text');
        this.productTitles = By.css('div.schema-product__title > a > span');
        this.firstProductSelector = '#schema-products > div:nth-child(2) > div > div.schema-product__part.schema-product__part_2 > div.schema-product__part.schema-product__part_4 > div.schema-product__title > a'
        this.addToCartButtonSelector = '#container > div > div > div > div > div.catalog-content.js-scrolling-area > div.product.product_details.b-offers.js-product > main > div > div > aside > div:nth-child(1) > div.product-aside__offers > div.product-aside__offers-list > div.product-aside__offers-item.product-aside__offers-item_primary > div.product-aside__control.product-aside__control_condensed-additional > a.button-style.button-style_base-alter.button-style_primary.product-aside__button.product-aside__button_narrow.product-aside__button_cart.button-style_expletive';
        this.selectedMethodSelector = '#schema-order > a'
        this.mostExpensiveSelector = '#schema-order > div.schema-order__popover > div > div:nth-child(3)'
        this.goodPriceSelector = 'a.schema-product__price-value.schema-product__price-value_primary.js-product-price-link'
        this.socialLinkSelector = 'div.footer-style__social > a'
    }

    async open() {
        await this.driver.get(link);
        await this.driver.wait(until.elementsLocated(this.filterCheckboxItems), 10e3);
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
        if (await this.driver.getCurrentUrl() !== link) {
            await this.driver.get(link)
        }
        await this.driver.wait(until.elementLocated(By.css(this.firstProductSelector)))
        const firstProductLink = await this.driver.findElement(By.css(this.firstProductSelector));
        await this.driver.get(firstProductLink.getAttribute('href'));
    }

    async addToCart() {
        await this.driver.wait(until.elementLocated(By.css(this.addToCartButtonSelector)));
        const addToCartButton = await this.driver.findElement(By.css(this.addToCartButtonSelector));
        await this.driver.executeScript('arguments[0].style.border="10px solid red"', addToCartButton);
        addToCartButton.click();
        await this.driver.sleep(2e3);
        await this.driver.get(cartLink);
        await this.driver.wait(until.elementLocated(By.css('div.cart-form__offers-list')), 5e3);
    }

    async setInputValue(newValue) {
        const inputSelector = '#container > div.cart-content > div > div > div > div > div.cart-form__body > div > div.cart-form__offers > div > div > div.cart-form__offers-item.cart-form__offers-item_secondary > div > div.cart-form__offers-part.cart-form__offers-part_action > div > div.cart-form__offers-part.cart-form__offers-part_count > div > div > div > input';
        const input = await this.driver.findElement(By.css(inputSelector));
        await input.sendKeys(Key.DELETE, Key.DELETE, newValue);
        if (await input.getAttribute('value') === newValue) {
            throw new Error(`новое значение равняется ${newValue}, так нельзя`);
        }
    }
    async setSortingOrderToPriceDescending() {
        await this.driver.get(link)
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
        await this.driver.get(link)
        await this.driver.wait(until.elementLocated(By.css(this.socialLinkSelector)), 20e3)
        const socialLink = await this.driver.findElement(By.css(this.socialLinkSelector))
        const expectedHref = await socialLink.getAttribute('href')
        await this.driver.get(expectedHref)
        await this.driver.wait(until.elementLocated(By.tagName('body')), 5e3)
        return expectedHref
    }
}

class CartPage {
    constructor(driver) {
        this.driver = driver
        this.amountInputSelector = '#container > div.cart-content > div > div > div > div > div.cart-form__body > div > div.cart-form__offers > div > div > div.cart-form__offers-item.cart-form__offers-item_secondary > div > div.cart-form__offers-part.cart-form__offers-part_action > div > div.cart-form__offers-part.cart-form__offers-part_count > div > div > div > input';
        this.cityInputSelector = '#container > div > div.cart-wrapper > div > div > div > div.cart-form__body > div > div.cart-form__flex > div.cart-form__part.cart-form__part_wide > div > div > div.cart-form__step-item.cart-form__step-item_secondary > div:nth-child(3) > div > div:nth-child(1) > div > div.cart-form__field > div > div > div > div > div > input'
        this.optionsWrapperSelector = 'div.auth-dropdown'
        this.elementInCartSelecor = '#container > div.cart-content > div > div > div > div > div.cart-form__body > div > div.cart-form__offers > div > div'
        this.makeOrderButtonSelector = '#container > div.cart-content > div > div > div > div > div.cart-form__body > div > div.cart-form__offers > div > div > div.cart-form__offers-item.cart-form__offers-item_additional > div > div.cart-form__offers-part.cart-form__offers-part_total > div.cart-form__offers-flex.cart-form__offers-flex_reverse_extended > div > div > a'
    }

    async setAmountValue(newValue) {
        await this.driver.get(cartLink);
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
        await this.driver.get(cartLink)
        await this.driver.wait(until.elementLocated(By.css(this.elementInCartSelecor)))
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

class CatalogOnlinerTester {
    constructor() {
        this.driver = new Builder().forBrowser('chrome').build();
        this.catalogPage = new CatalogPage(this.driver);
        this.cartPage = new CartPage(this.driver)

        this.nonExistingCityName = 'xd'
        this.tooLongCityName = 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'
    }

    async filterByManufacturer(textToFind) {
        try {
            await this.catalogPage.open();
            await this.catalogPage.filterByManufacturer(textToFind);

            const productTitles = await this.catalogPage.getProductTitles();
            for (let i = 0; i < productTitles.length; i++) {
                try {
                    const titleText = await productTitles[i].getText();
                    if (!titleText.includes(textToFind)) {
                        throw new Error(`the good must not be here - ${titleText}`);
                    }
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

describe('test suite 1', () => {
    let tester;

    beforeAll(() => {
        tester = new CatalogOnlinerTester();
    });

    afterAll(async () => {
        await tester.driver.quit();
    });

    test('filter by manufacturer', async () => {
        const result = await tester.filterByManufacturer('Palit');
        expect(result).toBeTruthy();
    }, 30e3);
    test('sort by price desc', async () => {
        const result = await tester.sortByPrice();
        expect(result).toBeTruthy();
    }, 30e3);
    test('add good to cart', async () => {
        const result = await tester.addGoodToCart()
        expect(result).toBeTruthy()
    }, 30e3)
    test('set amount of good in the cart to zero', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue('0')
        expect(result).toBeTruthy()
    }, 30e3)
    test('set amount of good in the cart to negative number', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue('-1')
        expect(result).toBeTruthy()
    }, 30e3)
    test('set amount of good in the cart to big number', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue('99999999')
        expect(result).toBeTruthy()
    }, 30e3)
    test('set amount of good in the cart to text', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue('qwerty')
        expect(result).toBeTruthy()
    }, 30e3)
    test('enter non-existing city name', async () => {
        const result = await tester.setCityName(tester.nonExistingCityName)
        expect(result).toBeTruthy()
    }, 300e3)
    test('enter too long city name', async () => {
        const result = await tester.setCityName(tester.tooLongCityName)
        expect(result).toBeTruthy()
    }, 300e3)
    test('check vk link', async () => {
        const result = await tester.vkLinkCheck()
        expect(result).toBeTruthy()
    }, 300e3)
});