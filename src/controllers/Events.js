const Abstract = require('./Abstract');

class Events extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('events', { user: req.user }));
    }
}

module.exports = Events;
