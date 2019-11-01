const Abstract = require('./Abstract');

const DEFAULT_LIMIT = 300;

class Search extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('search', { user: req.user, skip: 0, limit: DEFAULT_LIMIT }));
    }

    async search(req, res) {
        const search = req.body.search.trim();
        const skip = +req.body.skip || 0;
        const limit = +req.body.limit || DEFAULT_LIMIT;
        let result;

        if (search) {
            if (search[0] === '@') {
                result = await global.db
                    .collection('users')
                    .find({ username: search.slice(1), active: true }, { skip, limit })
                    .toArray();
            } else {
                result = await global.db
                    .collection('users')
                    .find({ $text: { $search: search }, active: true }, { skip, limit })
                    .toArray();
            }
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
