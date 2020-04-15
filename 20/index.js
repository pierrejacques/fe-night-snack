const { JSDOM } = require('jsdom');

const jsDomIntance = new JSDOM(`
  <!DOCTYPE html>
  <body>
    <p id="root">夜点心的大本营</p>
  </body>
`)

const window = jsDomIntance.window; // window 对象
const document = window.document; // document 对象
