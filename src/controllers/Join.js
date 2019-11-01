const Abstract = require('./Abstract');

class Join extends Abstract {
    async getPage(req, res) {
        res.send(this.renderPage('join', { user: req.user }));
    }

    async handleJoin(req, res) {
        const currentUser = req.user;
        let username = req.body.username;
        let active = false;

        if (!username) {
            res.send(this.renderPage('join', { user: req.user }));
            return;
        }

        if (username[0] === '@') {
            username = username.slice(1);
        }

        let user = await global.db.collection('users').findOne({ username });

        if (!user) {
            user = await this.createUser(username);
        }

        if (user.active) {
            res.send(this.renderPage('join', { alreadyActive: true, user: req.user }));
            return;
        } else {
            if (user.tgUserId) {
                if (user.requires + 1 === 3) {
                    global.bot.sendMessage(
                        user.tgUserId,
                        `Пользователь @${currentUser.username} пригласил вас! У вас уже 3 приглашения, теперь вы можете войти в приложение!`
                    );
                } else {
                    global.bot.sendMessage(
                        user.tgUserId,
                        `Пользователь @${currentUser.username} пригласил вас! Вам нужно ещё ${3 -
                            (user.requires + 1)} приглашений...`
                    );
                }
            }
        }

        if (user.requiredBy.includes(currentUser.username) && currentUser.username !== 'oPavlov') {
            res.send(this.renderPage('join', { alreadyActiveByUser: true, user: req.user }));
            return;
        }

        const update = { $inc: { requires: 1 }, $addToSet: { requiredBy: currentUser.username } };

        if (user.requires + 1 === 3) {
            update.$set = { active: true };
            active = true;
        }

        await global.db.collection('users').updateOne({ username }, update);

        res.send(
            this.renderPage('join', {
                success: true,
                active,
                requiresNeeded: 3 - (user.requires + 1),
                user: req.user,
            })
        );
    }
}

module.exports = Join;
