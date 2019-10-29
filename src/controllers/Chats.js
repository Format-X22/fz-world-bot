const Abstract = require('./Abstract');

class Chats extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('chats'));
    }

    async sendLink(req, res) {
        // TODO -
        res.send(this.renderPage('chats', { send: true }));
    }
}

module.exports = Chats;
