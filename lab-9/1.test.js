const {Builder, By, until, Key} = require("selenium-webdriver");
const {StaleElementReferenceError, NoSuchElementError, TimeoutError} = require("selenium-webdriver/lib/error");
const { expect } = require('@jest/globals');
const assert = require("assert");

const link = 'https://catalog.onliner.by/videocard'
const cartLink = 'https://cart.onliner.by'

class CatalogOnlinerTester {
    driver;
    constructor() {
        this.driver = new Builder().forBrowser('chrome').build()
        // this.driver.manage().addCookie({
        //     name: 'fingerprint',
        //     value: 'a26708e9-09a9-4c51-8fcc-94bdb68a914c'
        // }).then(r => {
        // })
        // this.driver.manage().addCookie({
        //     name: 'logged_in',
        //     value: '1'
        // }).then(r => {
        // })
        // this.driver.manage().addCookie({
        //     name: 'catalog_session',
        //     value: 'o8pAsxuKCI7hy3Ke43ERgo9q9G2eqQPoVsl0Msyg'
        // }).then(r => {
        // })
        // this.driver.manage().addCookie({
        //     name: 'delivery-region-id',
        //     value: '17030'
        // }).then(r => {
        // })
        // this.driver.manage().addCookie({
        //     name: 'compare',
        //     value: []
        // }).then(r => {
        // })
        // this.driver.manage().addCookie({
        //     name: 'ADC_REQ_2E94AF76E7',
        //     value: '325D4D761C2D8EE6164279573EC6C62DDC53487A0CFE09260D0AEAE09CDAFA5428163EF4FE03DB8E'
        // }).then(r => {
        // })
    }
    async filterByManufacturer(textToFind) {
        const driver = this.driver;

        try {
            await driver.get(link);

            const labels = await driver.findElements(By.css('label.schema-filter__checkbox-item'))
            for (let label of labels) {
                const manufacturer = await label.findElement(By.css('span.schema-filter__checkbox-text'))
                const innerText = await manufacturer.getText()
                if (innerText === textToFind) {
                    await driver.executeScript("arguments[0].click()", label);
                    await this.driver.sleep(1e3)
                    break
                }
            }
            await driver.wait(until.elementsLocated(By.className('schema-product')), 10e3); // Максимальное время ожидания - 10 секунд

            const productTitles = await driver.findElements(By.css('div.schema-product__title > a > span'));
            for (let i = 0; i < productTitles.length; i++) {
                try {
                    const titleText = await productTitles[i].getText();
                    if (!titleText.includes(textToFind)) {
                        return false
                    }
                } catch (error) {
                    if (error instanceof StaleElementReferenceError) {
                        const refreshedProductTitles = await driver.findElements(By.css('div.schema-product__title > a > span'));
                        productTitles[i] = refreshedProductTitles[i];
                        i--;
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка в тесте:', error);
            return false
        }
        return true
    }
    async addGoodToCart(){
        try {
            await this.driver.get(link)
            await this.driver.wait(until.elementsLocated(By.className('schema-product')), 10e3);
            const firstProductLink = await this.driver.findElement(By.css('#schema-products > div:nth-child(2) > div > div.schema-product__part.schema-product__part_2 > div.schema-product__part.schema-product__part_4 > div.schema-product__title > a'))
            await this.driver.get(firstProductLink.getAttribute('href'))
            const addToCartSelector = '#container > div > div > div > div > div.catalog-content.js-scrolling-area > div.product.product_details.b-offers.js-product > main > div > div > aside > div:nth-child(1) > div.product-aside__offers > div.product-aside__offers-list > div.product-aside__offers-item.product-aside__offers-item_primary > div.product-aside__control.product-aside__control_condensed-additional > a.button-style.button-style_base-alter.button-style_primary.product-aside__button.product-aside__button_narrow.product-aside__button_cart.button-style_expletive'
            await this.driver.wait(until.elementLocated(By.css(addToCartSelector)))
            const addToCartButton = await this.driver.findElement(By.css(addToCartSelector));
            await this.driver.executeScript('arguments[0].style.border="10px solid red"', addToCartButton)
            addToCartButton.click();
            await this.driver.sleep(2e3)
            await this.driver.get(cartLink)
            await this.driver.wait(until.elementLocated(By.css('div.cart-form__offers-list')), 5e3);
            return true

        } catch (error) {
            console.error('Ошибка в тесте:', error);
            return false
        }
    }
    async setInputValue(newValue) {
        try {
            await this.driver.get(cartLink)
            const inputSelector = '#container > div.cart-content > div > div > div > div > div.cart-form__body > div > div.cart-form__offers > div > div > div.cart-form__offers-item.cart-form__offers-item_secondary > div > div.cart-form__offers-part.cart-form__offers-part_action > div > div.cart-form__offers-part.cart-form__offers-part_count > div > div > div > input'
            await this.driver.wait(until.elementLocated(By.css(inputSelector)))
            const input = await this.driver.findElement(By.css(inputSelector))
            await input.sendKeys(Key.DELETE, Key.DELETE, newValue)
            if (await input.getAttribute('value') === newValue) {
                throw new Error(`новое значение равняется ${newValue}, так нельзя`)
            }
            return true
        } catch (error) {
            console.error('Ошибка в тесте:', error);
            return false
        }
    }
    async vkLinkCheck() {
        try {
            await this.driver.get(link)
            await this.driver.wait(until.elementLocated(By.css('div.footer-style__social > a')), 20e3)
            const socialLink = await this.driver.findElement(By.css('div.footer-style__social > a'))
            const expectedHref = await socialLink.getAttribute('href')
            await this.driver.get(expectedHref)
            await this.driver.wait(until.elementLocated(By.tagName('body')), 5e3)
            const providedUrl = await this.driver.getCurrentUrl()
            if (expectedHref !== providedUrl) {
                throw new Error(`expected ${expectedHref} provided ${providedUrl}`)
            }
            return true
        } catch (error) {
            console.error('Ошибка в тесте:', error);
            return false
        }
    }
    async setCityName(cityName) {
        let cityInput
        let initialCityName
        try {
            await this.driver.get(cartLink)
            const elementInCartSelecor = '#container > div.cart-content > div > div > div > div > div.cart-form__body > div > div.cart-form__offers > div > div'
            await this.driver.wait(until.elementLocated(By.css(elementInCartSelecor)))
            const makeOrderButton = this.driver.findElement(By.css('#container > div.cart-content > div > div > div > div > div.cart-form__body > div > div.cart-form__offers > div > div > div.cart-form__offers-item.cart-form__offers-item_additional > div > div.cart-form__offers-part.cart-form__offers-part_total > div.cart-form__offers-flex.cart-form__offers-flex_reverse_extended > div > div > a'))
            makeOrderButton.click()
            const cityInputSelector = '#container > div > div.cart-wrapper > div > div > div > div.cart-form__body > div > div.cart-form__flex > div.cart-form__part.cart-form__part_wide > div > div > div.cart-form__step-item.cart-form__step-item_secondary > div:nth-child(3) > div > div:nth-child(1) > div > div.cart-form__field > div > div > div > div > div > input'
            await this.driver.wait(until.elementLocated(By.css(cityInputSelector)))
            cityInput = await this.driver.findElement(By.css(cityInputSelector))
            initialCityName = await cityInput.getAttribute('value')
            await cityInput.sendKeys(cityName)
            await this.driver.sleep(4e3)
            const optionsWrapperSelector = 'div.auth-dropdown'
            const optionsWrapper = await this.driver.findElement(By.css(optionsWrapperSelector))
            const innerText = await optionsWrapper.getText()
            console.log(innerText)

            if (innerText !== 'Результатов не найдено') {
                throw new Error(`length: ${innerText.length} ${innerText}`)
            }
            return true
        } catch (error) {
            const finalCityName = await cityInput.getAttribute('value')
            if ((error instanceof NoSuchElementError || error instanceof TimeoutError) &&
                finalCityName === initialCityName) {
                return true
            }
            console.error('Ошибка в тесте:', error);
            return false
        }
    }
    async sortByPrice() {
        await this.driver.get(link)
        const selectedMethodSelector = '#schema-order > a'
        await this.driver.wait(until.elementLocated(By.css(selectedMethodSelector)))
        const selectedMethodElement = await this.driver.findElement(By.css(selectedMethodSelector))
        await selectedMethodElement.click()
        await this.driver.sleep(1e3)
        const mostExpensiveSelector = '#schema-order > div.schema-order__popover > div > div:nth-child(3)'
        const mostExpensiveElement = await this.driver.findElement((By.css(mostExpensiveSelector)))
        await mostExpensiveElement.click()
        await this.driver.sleep(5e3)
        const goodPriceSelector = 'a.schema-product__price-value.schema-product__price-value_primary.js-product-price-link'
        const priceElements = await this.driver.findElements((By.css(goodPriceSelector)))
        let pricesArray = []
        for (const e of priceElements) {
            const price = await e.getText();
            pricesArray.push(price.slice(price));
        }
        const numericArray = pricesArray.map(str => parseFloat(str.replace(/[^\d.,]/g, '').replace(',', '.')));
        console.log(pricesArray)
        console.log(numericArray)
        for (let i = 0; i < numericArray.length - 1; i++) {
            if (numericArray[i] < numericArray[i + 1]) {
                console.log(numericArray[i])
                return false;
            }
        }

        return true;
    }
    async authorize(username, password) {
        await this.driver.get(link)
        await this.driver.wait(until.elementsLocated(By.css('div.b-top-profile__list')), 100e3)
    }
}


describe('test suite 1', () => {
    let tester

    beforeAll(() => {
        tester = new CatalogOnlinerTester()
    })
    afterAll(async () => {
        await tester.driver.quit()
        await tester.close()
    })

    test('filter by manufacturer', async () => {
        const result = await tester.filterByManufacturer('Palit')
        expect(result).toBe(true)
    }, 30e3)
    test('sort by price desc', async () => {
        const result = await tester.sortByPrice()
        expect(result).toBe(true)
    }, 30e3)
    test('add good to cart', async () => {
        const result = await tester.addGoodToCart()
        expect(result).toBe(true)
    }, 30e3)
    test('set amount of good in the cart to zero', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue('0')
        expect(result).toBe(true)
    }, 30e3)
    test('set amount of good in the cart to negative number', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue('-1')
        expect(result).toBe(true)
    }, 30e3)
    test('set amount of good in the cart to big number', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue('99999999')
        expect(result).toBe(true)
    }, 30e3)
    test('set amount of good in the cart to text', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue('qwerty')
        expect(result).toBe(true)
    }, 30e3)
    test('enter non-existing city name', async () => {
        const result = await tester.setCityName('xd')
        expect(result).toBe(true)
    }, 300e3)
    test('enter too long city name', async () => {
        const result = await tester.setCityName('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')
        expect(result).toBe(true)
    }, 300e3)
    test('check vk link', async () => {
        const result = await tester.vkLinkCheck()
        expect(result).toBe(true)
    }, 300e3)
})
