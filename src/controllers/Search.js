const Abstract = require('./Abstract');

class Search extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('search', { user: req.user, skip: 0, limit: 20 }));
    }

    async search(req, res) {
        const search = req.body.search;
        const skip = +req.body.skip || 0;
        const limit = +req.body.limit || 20;
        let result;

        if (search) {
            result = await global.db
                .collection('users')
                .find({ $text: { $search: search }, active: true }, { skip, limit })
                .toArray();
        } else {
            result = await global.db
                .collection('users')
                .find({ active: true }, { skip, limit })
                .toArray();
        }

        res.send(this.renderPage('search', { user: req.user, result, skip, limit, search }));
    }
}

module.exports = Search;
