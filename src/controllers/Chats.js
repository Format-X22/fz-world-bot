const Abstract = require('./Abstract');

class Chats extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('chats', { user: req.user }));
    }

    async sendLink(req, res) {
        // TODO -
        res.send(this.renderPage('chats', { send: true, user: req.user }));
    }
}

module.exports = Chats;
