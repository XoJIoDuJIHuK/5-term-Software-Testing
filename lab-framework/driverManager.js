const {Builder} = require("selenium-webdriver")
const fs = require("fs")

module.exports = class DriverManager {
    static driver;
    static getDriver() {
        if (!this.driver) {
            let defaultDriverName = fs.readFileSync('config.json')
            switch (defaultDriverName) {
                case 'firefox':
                    this.driver = new Builder().forBrowser(defaultDriverName.toString()).build()
                    break
                default:
                    this.driver = new Builder().forBrowser('chrome').build()
                    break
            }
        }
        return this.driver
    }
}