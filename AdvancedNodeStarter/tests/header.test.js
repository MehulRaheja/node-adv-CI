const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');

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

test('The header has the correct text', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);  // it will select an element from current page
  // which is an anchor tag '<a>' with class 'brand-logo' and returns the html text inside the element
  // puppeteer will serialize function (el => el.innerHTML) into a text then sends to chromium instance.
  // then that text serialize back to function and get executed and we get the string out of it.

  expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
  await page.click('.right a');  // to click a particular element which inside css class right and is an anchor tag

  const url = await page.url(); //to get url of the current page

  // console.log(url);
  expect(url).toMatch(/accounts\.google\.com/)  // regex function to match part of the string.
});

// test.only to run only one test selected test
test('When signed in, shows logout button', async () => {
  // const id = '63bbad9f834d1d4ef8c01e2c'; // take existing userId

  const { session, sig } = sessionFactory();

  await page.setCookie({ name: 'session', value: session }); // create cookie for session
  await page.setCookie({ name: 'session.sig', value: sig }); // create cookie for session signature
  await page.goto('localhost:3000'); // refreshed page to re-render page to see changes after login
  await page.waitFor('a[href="/auth/logout"]'); // test will wait for this element to appear then resume further execution

  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML); // use different kind of quotes here
  expect(text).toEqual('Logout');
});