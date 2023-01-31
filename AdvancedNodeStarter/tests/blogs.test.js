const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

// describe is a global function provided by JEST
describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog creation form', async () => {

    const label = await page.getContentOf('form label');

    expect(label).toEqual('Blog Title');
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      // page.type in first argument take the selector for the input field and in second argument it takes the text we want to write
      await page.type('.title input', 'My Title');
      await page.type('.content input', 'My Content');
      await page.click('form button');
    });
    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      // after clicking button it will make an api call and screen will change so we have to wait for new screen to appear first so we 
      // use waitFor function here to ensure operation is done and new screen appeared before we check for the success of the operation.
      await page.waitFor('.card');

      const title = await page.getContentOf('.card-title');
      const content = await page.getContentOf('p');

      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });
  });

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('the form shows an error message', async () => {
      const titleError = await page.getContentOf('.title .red-text');
      const contentError = await page.getContentOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });

});

describe('User is not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'T',
        content: 'C'
      }
    }
  ];

  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });

  //  ALTERNATE METHOD OF TESTING
  // test('User cannot create blog posts', async () => {

  //   //page.evaluate can take a function and arguments to execute
  //   // we use evaluate beacause if we add function directly to the test then it will be executed by JEST(test), but we want it to executed by chromium
  //   // evaluate will convert this func into string and send it to chromium
  //   // using 'omit' will not send cookie by default, using 'include' will always add cookie
  //   const result = await page.post('/api/blogs', { title: 'My Title', content: 'My Content' });


  //   expect(result).toEqual({ error: "You must log in!" });
  // });
  // test('User cannot get a list of posts', async () => {

  //   const result = await page.get('/api/blogs');

  //   expect(result).toEqual({ error: "You must log in!" });
  // });
});