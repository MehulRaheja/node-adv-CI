const puppeteer = require('puppeteer');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, { // Proxy is inbuilt JS 2015 function, it is used to access functions of 2 or more objects(e.g. class)
      get: function (target, property) {  // get method accesses different objects/class methods
        return customPage[property] || page[property] || browser[property]
      }
    });
  }
}

module.exports = CustomPage;