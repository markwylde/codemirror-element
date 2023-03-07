import createTestSuite from 'just-tap';
import createPage from './helpers/createPage.js';
import createServer from './helpers/createServer.js';

const server = await createServer();

const { test, run } = createTestSuite({ concurrency: 3 });

const getCodeEditorTextArea = async page => {
  return await (await page.evaluateHandle(`
    document.querySelector("body > codemirror-editor").shadowRoot.querySelector("[contenteditable]")
  `)).asElement();
};

test('codemirror gets created', async (t) => {
  t.plan(1);
  const { page, close } = await createPage(server.url);
  const cmEditorExists = await page.evaluate(() => {
    document.body.innerHTML = '<codemirror-editor></codemirror-editor>';

    const codeMirrorElement = document.body.querySelector('codemirror-editor');
    return Boolean(
      codeMirrorElement.shadow.querySelector('.cm-editor')
    );
  });

  t.ok(cmEditorExists, 'codemirror was created');

  close();
});

test('codemirror has initial value', async (t) => {
  t.plan(1);

  const { page, close } = await createPage(server.url);
  const innerText = await page.evaluate(() => {
    document.body.innerHTML = '<codemirror-editor value="function main () {}"></codemirror-editor>';

    const codeMirrorElement = document.body.querySelector('codemirror-editor');
    return codeMirrorElement.shadow.querySelector('.cm-editor').innerText;
  });

  t.equal(innerText, '1\nfunction main () {}');

  close();
});

test('setting new value', async (t) => {
  t.plan(1);

  const { page, close } = await createPage(server.url);
  const innerText = await page.evaluate(() => {
    document.body.innerHTML = '<codemirror-editor value="function main () {}"></codemirror-editor>';

    const codeMirrorElement = document.body.querySelector('codemirror-editor');
    codeMirrorElement.value = 'test value';
    return codeMirrorElement.shadow.querySelector('.cm-editor').innerText;
  });

  t.equal(innerText, '1\ntest value');

  close();
});

test('typing updates value', async (t) => {
  t.plan(1);

  const { page, close } = await createPage(server.url);
  await page.evaluate(() => {
    document.body.innerHTML = '<codemirror-editor value="function main () {}"></codemirror-editor>';
  });

  const activeLine = await getCodeEditorTextArea(page);

  await activeLine.type('new value');

  const innerText = await page.evaluate(() => {
    const codeMirrorElement = document.body.querySelector('codemirror-editor');
    return codeMirrorElement.value;
  });

  t.equal(innerText, 'new valuefunction main () {}');

  close();
});

test('typing triggers change events', async (t) => {
  t.plan('new value'.length + 1);

  const { page, close } = await createPage(server.url);
  await page.exposeFunction('pass', (value) => t.pass(value));

  await page.evaluate(() => {
    document.body.innerHTML = '<codemirror-editor value="function main () {}"></codemirror-editor>';
    const codeMirrorElement = document.body.querySelector('codemirror-editor');
    codeMirrorElement.addEventListener('change', event => pass(event.target.value));
  });

  const activeLine = await getCodeEditorTextArea(page);
  await activeLine.type('new value');
  await page.keyboard.press('1');

  return () => {
    close();
  };
});

test('setting new value triggers change event', async (t) => {
  t.plan(1);

  const { page, close } = await createPage(server.url);
  await page.exposeFunction('equal', (actual, expected) => t.equal(actual, expected));

  await page.evaluate(() => {
    document.body.innerHTML = '<codemirror-editor value="function main () {}"></codemirror-editor>';
    const codeMirrorElement = document.body.querySelector('codemirror-editor');
    codeMirrorElement.addEventListener('change', event => equal(event.target.value, 'new value'));
    codeMirrorElement.value = 'new value';
  });

  return () => {
    close();
  };
});

const stats = await run();
server.close();

if (!stats?.success) {
  throw new Error('not all tests passed');
}
