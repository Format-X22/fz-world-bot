const Abstract = require('./Abstract');

class Join extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('join'));
    }

    async handleJoin(req, res) {
        const currentUser = await this.extractUser();
        let nick = req.body.nick;
        let active = false;

        if (!nick) {
            res.send(this.renderPage('join'));
            return;
        }

        if (nick[0] === '@') {
            nick = nick.slice(1);
        }

        let user = await global.db.collection('users').findOne({ nick });

        if (!user) {
            user = await this.createUser(nick);
        }

        if (user.active) {
            res.send(this.renderPage('join', { alreadyActive: true }));
            return;
        }

        if (user.requiredBy.includes(currentUser.nick)) {
            res.send(this.renderPage('join', { alreadyActiveByUser: true }));
            return;
        }

        const update = { $inc: { requires: 1 }, $addToSet: { requiredBy: currentUser.nick } };

        if (user.requires + 1 === 3) {
            update.$set = { active: true };
            active = true;
        }

        await global.db.collection('users').updateOne({ nick }, update);

        res.send(
            this.renderPage('join', {
                success: true,
                active,
                requiresNeeded: 3 - (user.requires + 1),
            })
        );
    }
}

module.exports = Join;
