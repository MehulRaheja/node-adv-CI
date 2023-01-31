const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
  // to launch chromium browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']   // this option will dramatically decrease our time for running the test
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
    await this.page.goto('http://localhost:3000/blogs'); // refreshed page to re-render page to see changes after login
    await this.page.waitFor("a[href='/auth/logout']"); // test will wait for this element to appear then resume further execution

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

  get(path) {
    return this.page.evaluate((_path) => {
      return fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json' 
        }
      }).then(res => res.json());
    }, path);
  }
  // evaluate func. takes ...args as arguments for the function, we cannot directly arguments to the function as it converts function into string before sending it to chromium

  post(path, data) {
    return this.page.evaluate(async (_path, _data) => {
      return fetch(_path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_data)
      }).then(res => res.json());
      // convert response into json
    }, path, data);
  }

  execRequests(actions) {
    // .map will return array of promises and Promise.all will wait for all the promises to resolve  and return them as a single promise
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }
}

module.exports = CustomPage;