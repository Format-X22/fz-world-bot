const Abstract = require('./Abstract');

class Unregistered extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('unregistered', { user: req.user }));
    }
}

module.exports = Unregistered;
