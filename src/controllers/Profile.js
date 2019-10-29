const Abstract = require('./Abstract');

class Profile extends Abstract {
    async getProfilePage(req, res) {
        const user = await this.extractUser(req);

        if (!user) {
            res.redirect('unregistered');
            return;
        }

        res.send(this.renderPage('profile', user));
    }

    async getEditPage(req, res) {
        const user = await this.extractUser(req);

        res.send(this.renderPage('editProfile', user));
    }

    async edit(req, res) {
        const user = await this.extractUser(req);
        const { description, job, family, interesting } = req.body || {};

        await global.db.collection('users').updateOne({
            description,
            job,
            family,
            interesting,
        });

        res.send(this.renderPage('profile', user));
    }
}

module.exports = Profile;
