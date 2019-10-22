const Abstract = require('./Abstract');

class Chats extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('chats'));
    }
}

module.exports = Chats;
