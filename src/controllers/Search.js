const Abstract = require('./Abstract');

class Search extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('search', { user: req.user }));
    }

    async search(req, res) {
        const search = req.body.search;

        // TODO -
        res.send(this.renderPage('search', { user: req.user }));
    }
}

module.exports = Search;
