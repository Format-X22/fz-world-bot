const Abstract = require('./Abstract');

class Unregistered extends Abstract {
    async getPage(req, res) {
        console.log('UNREGISTERED', req.user.username);
        res.send(this.renderPage('unregistered', { user: req.user }));
    }
}

module.exports = Unregistered;
