const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
  // to launch chromium browser
    const browser = await puppeteer.launch({
      headless: false
    });

    const page = await browser.newPage(); // to launch a new tab
    const customPage = new CustomPage(page);

    return new Proxy(customPage, { // Proxy is inbuilt JS 2015 function, it is used to access functions of 2 or more objects(e.g. class)
      get: function (target, property) {  // get method accesses different objects/class methods
        return customPage[property] || browser[property] || page[property] //priority should matter because browser and page has close() but we want to use browser class's close() function
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {

    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session }); // create cookie for session
    await this.page.setCookie({ name: 'session.sig', value: sig }); // create cookie for session signature
    await this.page.goto('localhost:3000/blogs'); // refreshed page to re-render page to see changes after login
    await this.page.waitFor('a[href="/auth/logout"]'); // test will wait for this element to appear then resume further execution

  }

  // // browser and page both have close() function but we required browser's func. so we are giving it the priority
  // // by separately defining close() function
  // constructor(page, browser) {
  //   this.page = page;
  //   this.browser = browser;
  // }
  // close() {
  //   this.browser.close();
  // }

  async getContentOf(selector) {
    return await this.page.$eval(selector, el => el.innerHTML);  // it will select an element from current page
    // which is an anchor tag '<a>' with class 'brand-logo' and returns the html text inside the element
    // puppeteer will serialize function (el => el.innerHTML) into a text then sends to chromium instance.
    // then that text serialize back to function and get executed and we get the string out of it.
  }
}

module.exports = CustomPage;