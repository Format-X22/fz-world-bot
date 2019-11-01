const fetch = require('node-fetch');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const port = process.env.FZ_PORT || 4000;
const ChatsController = require('./controllers/Chats');
const JoinController = require('./controllers/Join');
const ProfileController = require('./controllers/Profile');
const ReverseController = require('./controllers/Reverse');
const SearchController = require('./controllers/Search');
const AboutController = require('./controllers/About');
const UnregisteredController = require('./controllers/Unregistered');

class Main {
    constructor() {
        this._chatsController = new ChatsController();
        this._joinController = new JoinController();
        this._profileController = new ProfileController();
        this._reverseController = new ReverseController();
        this._searchController = new SearchController();
        this._aboutController = new AboutController();
        this._unregisteredController = new UnregisteredController();
    }

    async init() {
        await this._initDb();
        await this._initWeb();
        await this._initTelegram();
        await this._initSuperAdmin();
    }

    async _initDb() {
        const client = await MongoClient.connect(
            process.env.FZ_DB_PATH || 'mongodb://fz-world-mongo/'
        );

        global.db = client.db(process.env.FZ_DB_NAME || 'admin');

        global.db.collection('users').createIndex({ '$**': 'text' });
    }

    async _initWeb() {
        app.use(express.static(__dirname + '/static'));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(this._passUser.bind(this));

        app.get('/', this._profileController.getProfilePage.bind(this._profileController));
        app.get('/profile', this._profileController.getProfilePage.bind(this._profileController));
        app.get('/editProfile', this._profileController.getEditPage.bind(this._profileController));
        app.post('/editProfile', this._profileController.edit.bind(this._profileController));

        app.get('/join', this._joinController.getPage.bind(this._joinController));
        app.post('/join', this._joinController.handleJoin.bind(this._joinController));

        app.get('/search', this._searchController.getPage.bind(this._searchController));
        app.post('/search', this._searchController.search.bind(this._searchController));

        app.get('/chats', this._chatsController.getPage.bind(this._chatsController));
        app.post('/chats', this._chatsController.sendLink.bind(this._chatsController));

        app.get('/reverse', this._reverseController.getPage.bind(this._reverseController));
        app.post('/reverse', this._reverseController.registerReverse.bind(this._reverseController));

        app.get('/about', this._aboutController.getPage.bind(this._aboutController));

        app.get(
            '/unregistered',
            this._unregisteredController.getPage.bind(this._unregisteredController)
        );

        app.listen(port, () => console.log(`On port ${port}!`));
    }

    async _initTelegram() {
        const bot = new TelegramBot(process.env.FZ_BOT_KEY, { polling: true });

        global.bot = bot;

        bot.on('message', async msg => {
            const chatId = msg.chat.id;

            await this._saveChatId(msg);
            await this._parseAvatar(bot, msg);
            await bot.sendGame(chatId, 'fzWorldBot');
        });

        bot.on('callback_query', async callbackQuery => {
            const token = jwt.sign(callbackQuery.from, process.env.FZ_BOT_KEY);

            await this._saveChatId(callbackQuery);
            await this._parseAvatar(bot, callbackQuery);
            await bot.answerCallbackQuery(callbackQuery.id, {
                url: `http://ec2-13-59-75-149.us-east-2.compute.amazonaws.com/?token=${token}`,
            });
        });
    }

    async _passUser(req, res, next) {
        const user = await this._extractUser(req);

        if (user && user.active) {
            req.user = user;
        } else if (
            [
                '/',
                '/profile',
                '/editProfile',
                '/join',
                '/search',
                '/chats',
                '/reverse',
                '/about',
            ].includes(req.path)
        ) {
            res.redirect('unregistered');
            return;
        }

        next();
    }

    async _extractUser(req) {
        const token = req.query.token;
        let rawUser;

        if (!token) {
            return null;
        }

        try {
            rawUser = jwt.verify(token, process.env.FZ_BOT_KEY);
        } catch (error) {
            return null;
        }

        const user = await global.db.collection('users').findOne({ username: rawUser.username });

        if (user) {
            return { ...user, token, tgUserId: rawUser.id };
        } else {
            return null;
        }
    }

    async _initSuperAdmin() {
        const user = await global.db.collection('users').findOne({ username: 'oPavlov' });

        if (!user) {
            await global.db.collection('users').insertOne({
                username: 'oPavlov',
                requires: 0,
                active: true,
                requiredBy: [],
                registeredInReverse: false,
                fullName: '',
                description: '',
                job: '',
                family: '',
                interesting: '',
                avatar: '',
            });
        }
    }

    async _saveChatId(msg) {
        const user = await global.db.collection('users').findOne({ username: msg.from.username });

        if (user) {
            await global.db
                .collection('users')
                .updateOne({ username: msg.from.username }, { tgUserId: msg.from.id });
        }
    }

    async _parseAvatar(bot, msg) {
        const user = await global.db.collection('users').findOne({ username: msg.from.username });

        if (user) {
            if (!fs.existsSync(__dirname + '/static/avatar/' + user.username + '.jpeg')) {
                const res = await bot.getUserProfilePhotos(msg.from.id);

                if (res.photos.length && res.photos[0][1].file_id) {
                    const file = await bot.getFile(res.photos[0][1].file_id);
                    const path = file.file_path;

                    if (path) {
                        const key = process.env.FZ_BOT_KEY;
                        const data = await fetch(`https://api.telegram.org/file/bot${key}/${path}`);

                        if (data) {
                            const to = fs.createWriteStream(
                                __dirname + '/static/avatar/' + user.username + '.jpeg'
                            );

                            data.body.pipe(to);
                        }
                    }
                }
            }

            await global.db.collection('users').updateOne(
                { username: msg.from.username },
                {
                    $set: {
                        fullName: [msg.from.first_name, msg.from.last_name].join(' '),
                    },
                }
            );
        }
    }
}

module.exports = Main;
