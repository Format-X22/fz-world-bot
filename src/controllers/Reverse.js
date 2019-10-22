const Abstract = require('./Abstract');

class Reverse extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('reverse'));
    }

    async registerReverse(req, res) {
        // TODO -
    }
}

module.exports = Reverse;
