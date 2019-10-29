const moment = require('moment');
const Abstract = require('./Abstract');

const MOSCOW_TIME_DIFF = 3;

class Reverse extends Abstract {
    constructor(...args) {
        super(...args);

        this._startMatchLoop();
    }

    async getPage(req, res) {
        const user = await this.extractUser(req);

        if (user.registeredInReverse) {
            res.send(this.renderPage('reverse', { registered: true }));
        } else {
            res.send(this.renderPage('reverse', { registered: false }));
        }
    }

    async registerReverse(req, res) {
        const user = await this.extractUser(req);

        await global.db
            .collection('users')
            .updateOne({ _id: user._id }, { $set: { registeredInReverse: true } });

        res.send(
            this.renderPage('reverse', {
                registered: true,
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
        // TODO -
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
