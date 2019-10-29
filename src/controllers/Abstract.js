const pug = require('pug');
const uiPath = __dirname + '/../ui/pages/';

class Abstract {
    renderPage(page, data) {
        return pug.renderFile(`${uiPath}${page}.pug`, data);
    }

    async extractUser(req) {
        // TODO -

        return { nick: 'oPavlov' };
    }

    async createUser(nick) {
        await global.db.collection('users').insertOne({
            nick,
            requires: 0,
            active: false,
            requiredBy: [],
            registeredInReverse: false,
            name: '',
            description: '',
            job: '',
            family: '',
            interesting: '',
        });

        return await global.db.collection('users').findOne({ nick });
    }
}

module.exports = Abstract;
