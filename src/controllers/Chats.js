const Abstract = require('./Abstract');

class Chats extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('chats', { user: req.user }));
    }

    async sendLink(req, res) {
        global.bot.sendMessage(
            req.user.tgUserId,
            `Ваша ссылка на чат "${req.body.name}" - ${req.body.link}`
        );

        res.send(this.renderPage('chats', { send: true, user: req.user }));
    }
}

module.exports = Chats;
