const DriverManager = require("./driverManager");
const {expect, describe, beforeAll, afterAll, test} = require("@jest/globals");
const CatalogOnlinerTester = require("./catalogOnlinerTester");
const {readFileSync} = require("fs");

describe('test suite 1', () => {
    let tester
    let manufacturer
    let amountInputValues
    let cityNames

    beforeAll(() => {
        const config = JSON.parse(readFileSync('config.json').toString())
        tester = new CatalogOnlinerTester(config);
        manufacturer = config.testData.manufacturer
        amountInputValues = config.testData.cartAmount
        cityNames = config.testData.cityName
    });

    afterAll(async () => {
        await tester.driver.quit();
    });

    test('filter by manufacturer', async () => {
        const result = await tester.filterByManufacturer(manufacturer);
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
        const result = await tester.setInputValue(amountInputValues[0])
        expect(result).toBeTruthy()
    }, 30e3)
    test('set amount of good in the cart to negative number', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue(amountInputValues[1])
        expect(result).toBeTruthy()
    }, 30e3)
    test('set amount of good in the cart to big number', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue(amountInputValues[2])
        expect(result).toBeTruthy()
    }, 30e3)
    test('set amount of good in the cart to text', async () => {
        //await tester.addGoodToCart()
        const result = await tester.setInputValue(amountInputValues[3])
        expect(result).toBeTruthy()
    }, 30e3)
    test('enter non-existing city name', async () => {
        const result = await tester.setCityName(cityNames[0])
        expect(result).toBeTruthy()
    }, 300e3)
    test('enter too long city name', async () => {
        const result = await tester.setCityName(cityNames[1])
        expect(result).toBeTruthy()
    }, 300e3)
    test('check vk link', async () => {
        const result = await tester.vkLinkCheck()
        expect(result).toBeTruthy()
    }, 300e3)
});