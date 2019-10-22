const Abstract = require('./Abstract');

class Search extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('search'));
    }

    async search(req, res) {
        // TODO -
    }
}

module.exports = Search;
