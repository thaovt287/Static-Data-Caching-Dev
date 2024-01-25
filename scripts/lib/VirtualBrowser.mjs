import puppeteer from "puppeteer";

export class VirtualBrowser {
  browser;

  constructor() {

  }

  async getBrowser () {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        executablePath: process.env.PUPPETEER_EXEC_PATH, // set by docker container
        headless: false,
      });
    }

    return this.browser;
  }

  async openPage (url) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.goto(url);

    return page;
  }

  async close () {
    await (await this.getBrowser()).close();
  }

  // Singleton
  static instance;

  static getInstance() {
    if (!VirtualBrowser.instance) {
      VirtualBrowser.instance = new VirtualBrowser();
    }

    return VirtualBrowser.instance;
  }
}