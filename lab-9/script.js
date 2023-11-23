const {Builder, By} = require("selenium-webdriver");

async function xd() {
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get('https://www.selenium.dev/selenium/web/web-form.html');
    let title = await driver.getTitle();
    await driver.manage().setTimeouts({implicit: 500});
    let textBox = await driver.findElement(By.name('my-text'));
    let submitButton = await driver.findElement(By.css('button'));
    await textBox.sendKeys('Selenium');
    await submitButton.click();
    let value = await message.getText();
    await driver.quit();
}

xd().then(() => {})