const Abstract = require('./Abstract');

class Profile extends Abstract {
    async getProfilePage(req, res) {
        // TODO -
        const user = await global.db.collection('users').findOne({ nick: '@oPavlov' });

        if (!user) {
            res.redirect('unregistered');
            return;
        }

        res.send(this.renderPage('profile', user));
    }

    async getEditPage(req, res) {
        res.send(
            this.renderPage('editProfile', {
                description: 'Играю в ФЗ 10 лет, люблю продукцию Apple!',
            })
        );
    }

    async edit(req, res) {
        // TODO -
    }
}

module.exports = Profile;
