const puppeteer = require('puppeteer');

let browser, page;

// this function will run before each test
beforeEach(async () => {
  // to launch chromium browser
  browser = await puppeteer.launch({
    headless: false   // headless means browser will open without GUI and here false means, don't start in headless mode
  });
  page = await browser.newPage();  // to launch a new tab
  await page.goto('localhost:3000');  // opens link 'localhost:3000' and await is used here because we need to execute this code before it execute further code lines

});

// this function will run after each test
afterEach(async () => {
  await browser.close();
});

test('We can launch a browser', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);  // it will select an element from current page
  // which is an anchor tag '<a>' with class 'brand-logo' and returns the html text inside the element
  // puppeteer will serialize function (el => el.innerHTML) into a text then sends to chromium instance.
  // then that text serialize back to function and get executed and we get the string out of it.

  expect(text).toEqual('Blogster');
});