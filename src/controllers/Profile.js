const Abstract = require('./Abstract');

class Profile extends Abstract {
    async getProfilePage(req, res) {
        const username = req.query.username;

        if (!username || username === req.user.username) {
            res.send(this.renderPage('profile', { user: req.user, isCurrentUser: true }));
            return;
        }

        const user = await global.db.collection('users').findOne({ username });

        if (!user) {
            res.send(this.renderPage('profile', { user: req.user, isCurrentUser: true }));
            return;
        }

        res.send(this.renderPage('profile', { user, isCurrentUser: false }));
    }

    async getEditPage(req, res) {
        res.send(this.renderPage('editProfile', { user: req.user }));
    }

    async edit(req, res) {
        const username = req.user.username;
        const { description, job, family, interesting } = req.body || {};

        await global.db.collection('users').updateOne(
            { username },
            {
                $set: {
                    description,
                    job,
                    family,
                    interesting,
                },
            }
        );

        const user = await global.db.collection('users').findOne({ username });

        res.send(
            this.renderPage('profile', {
                user: { ...user, token: req.user.token },
                isCurrentUser: true,
            })
        );
    }
}

module.exports = Profile;
