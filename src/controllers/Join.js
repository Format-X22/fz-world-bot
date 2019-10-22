const Abstract = require('./Abstract');

class Join extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('join'));
    }

    async handleJoin(req, res) {
        // TODO -
    }
}

module.exports = Join;
