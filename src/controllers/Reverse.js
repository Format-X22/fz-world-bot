const moment = require('moment');
const Abstract = require('./Abstract');

const MOSCOW_TIME_DIFF = 3;

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
            this._startMatchLoop();
        }, this._remainedToNextDay());
    }

    async _match() {
        const users = await global.db.collection('users').find({ registeredInReverse: true });

        if (!users.length) {
            return;
        }

        let left = null;

        for (const user of users) {
            if (!left) {
                left = user;
                continue;
            }

            // TODO Pair
        }

        // TODO Broadcast
    }

    _remainedToNextDay() {
        const diff = moment()
            .utc()
            .add(MOSCOW_TIME_DIFF * 2, 'hours');

        return moment()
            .utc()
            .startOf('day')
            .hour(MOSCOW_TIME_DIFF)
            .add(1, 'day')
            .diff(diff);
    }
}

module.exports = Reverse;
