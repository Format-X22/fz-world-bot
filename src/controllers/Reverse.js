const Abstract = require('./Abstract');

class Reverse extends Abstract {
    constructor(...args) {
        super(...args);

        this._startMatchLoop();
    }

    async getPage(req, res) {
        if (req.user.registeredInReverse) {
            res.send(this.renderPage('reverse', { registered: true, user: req.user }));
        } else {
            res.send(this.renderPage('reverse', { registered: false, user: req.user }));
        }
    }

    async registerReverse(req, res) {
        await global.db
            .collection('users')
            .updateOne({ _id: req.user._id }, { $set: { registeredInReverse: true } });

        res.send(
            this.renderPage('reverse', {
                registered: true,
                user: req.user,
            })
        );
    }

    _startMatchLoop() {
        setTimeout(() => {
            this._match().catch(error => console.log(error));
        }, 10000);

        setInterval(() => {
            this._match().catch(error => console.log(error));
        }, 1000 * 60 * 60);
    }

    async _match() {
        const users = await global.db
            .collection('users')
            .find({ registeredInReverse: true })
            .toArray();

        if (!users.length) {
            console.log('Empty registers!', users);

            return;
        }

        let left = null;

        for (const user of users) {
            if (!user.tgUserId) {
                console.log(`${JSON.stringify(user)} - unknown tgUserId`);
                continue;
            }

            if (!left) {
                left = user;
                continue;
            }

            const right = user;
            const message = 'А вот и ваш напарник по знакомству наоборот! Напишите ему! Ник - ';

            console.log(`PAIR - ${left.username} + ${right.username}`);

            global.bot.sendMessage(left.tgUserId, message + '@' + right.username);
            global.bot.sendMessage(right.tgUserId, message + '@' + left.username);

            await global.db
                .collection('users')
                .updateOne({ username: left.username }, { $set: { registeredInReverse: false } });
            await global.db
                .collection('users')
                .updateOne({ username: right.username }, { $set: { registeredInReverse: false } });

            left = null;
        }

        console.log(`Reverse done - ${new Date()}`);
    }
}

module.exports = Reverse;
