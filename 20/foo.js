const { JSDOM } = require('jsdom');

function dumFunction() {
  const cache = localStorage.getItem('cache-key');
  document.getElementById('dum-id').textContent = cache;
}

expect('dum test', () => {
  const { window } = new JSDOM(`<div id="dum-id" ></div>`, {
    url: 'http://localhost:3030'
  });
  global.localStorage = window.localStorage;
  global.document = window.document;
  const value = 'DUM_VALUE';
  localStorage.setItem('cache-key', value);

  dumFunction();
  console.log(document.getElementById('dum-id').textContent)

})
