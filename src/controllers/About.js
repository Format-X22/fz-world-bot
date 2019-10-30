const Abstract = require('./Abstract');

class About extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('about', { user: req.user }));
    }
}

module.exports = About;
