const Page = require('./helpers/page');

let page;

// this function will run before each test
beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');  // opens link 'localhost:3000' and await is used here because we need to execute this code before it execute further code lines

});

// this function will run after each test
afterEach(async () => {
  // actually it is a browser function
  await page.close(); // out coustom page class also have browser function so page can also close the browser
});

test('The header has the correct text', async () => {
  const text = await page.getContentOf('a.brand-logo');

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

  await page.login(); // call the login function inside page class newly created with Proxy

  const text = await page.$eval(`a[href="/auth/logout"]`, el => el.innerHTML); // use different kind of quotes here
  expect(text).toEqual('Logout');
});