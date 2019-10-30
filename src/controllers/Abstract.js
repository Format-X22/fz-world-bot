const jwt = require('jsonwebtoken');
const pug = require('pug');
const uiPath = __dirname + '/../ui/pages/';

class Abstract {
    renderPage(page, data) {
        return pug.renderFile(`${uiPath}${page}.pug`, data);
    }

    async createUser(username) {
        await global.db.collection('users').insertOne({
            username,
            requires: 0,
            active: false,
            requiredBy: [],
            registeredInReverse: false,
            fullName: '',
            description: '',
            job: '',
            family: '',
            interesting: '',
            avatar: '',
        });

        return await global.db.collection('users').findOne({ username });
    }
}

module.exports = Abstract;
