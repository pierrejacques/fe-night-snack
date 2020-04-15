const { JSDOM } = require('jsdom');
const location = require('mock-location');

const jsdom = new JSDOM(`<body>
  <div id="root" />
</body>`, {
  url: 'https://www.google.com'
})

const { window } = jsdom;

console.log(window.location.href);

jsdom.reconfigure({
  url: 'https://www.baidu.com'
})

delete window.location;

window.location = location;

window.location.href = 'https://www.youtube.com';

console.log(window.location.origin);
