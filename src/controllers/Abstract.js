const pug = require('pug');
const uiPath = __dirname + '/../ui/pages/';

class Abstract {
    renderPage(page, data) {
        return pug.renderFile(`${uiPath}${page}.pug`, data);
    }
}

module.exports = Abstract;
