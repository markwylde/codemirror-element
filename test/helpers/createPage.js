import puppeteer from 'puppeteer';
import createServer from './createServer.js';

async function createPage (url) {
  const server = await createServer();
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    devtools: true,
    args: ['--ignore-certificate-errors']
  });

  const close = () => {
    browser.close();
    server.close();
  };

  const [page] = await browser.pages();

  await page.goto(url);

  return {
    page,
    close
  };
}

export default createPage;
