const Abstract = require('./Abstract');

class Reverse extends Abstract {
    async getPage(req, res) {
        // TODO -
        res.send(this.renderPage('reverse', {
            registered: false
        }));
    }

    async registerReverse(req, res) {
        // TODO -
        res.send(this.renderPage('reverse', {
            registered: true
        }));
    }
}

module.exports = Reverse;
