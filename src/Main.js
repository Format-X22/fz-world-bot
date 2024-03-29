const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const port = process.env.FZ_PORT || 4000;
const ChatsController = require('./controllers/Chats');
const EventsController = require('./controllers/Events');
const JoinController = require('./controllers/Join');
const ProfileController = require('./controllers/Profile');
const ReverseController = require('./controllers/Reverse');
const SearchController = require('./controllers/Search');
const AboutController = require('./controllers/About');
const UnregisteredController = require('./controllers/Unregistered');

cloudinary.config({
    cloud_name: 'dqb0ab8py',
    api_key: '851838634674731',
    api_secret: process.env.FZ_CLOUDINARY_KEY,
});

// TODO Кнопка "Назад"

class Main {
    constructor() {
        this._chatsController = new ChatsController();
        this._eventsController = new EventsController();
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

        /*setTimeout(() => {
            for (const u of [130760168,522142267,304838138,645145766,100539320,270546823,188260970,971960646,434439239,255273097,77220240,299792718,564481405,425620910,406091399,938720319,472005657,306586416,523235656,368087280,239507819,491344658,77662041,75814925,311843252,411624073,764175076,100917981,229245875,333773228,93459832,596408794,308962021,626142847,179706803,436405849,579233469,484895628,199330833,96700014,111212377,1432662,401271448,836773951,143194181,234545077,859802203,480912863,162865277,720671805,533241669,315896914,533997487,40322523,514403538,658066466,366033323,361955244,503555255,854576117,274834650,91832022,147732646,150858297,269616148,72830606,832733729,143938346,348623265,259510644,411587850,199883386,522135432,43158353,595171420,241349370,600117254,213521725,313655358,122660548,81764916,3080623,276864938,3060890,473546784,381817773,216598330,161037536,784757754,482244560,56172448,715497359,263076330,459086027,76624563,439881239,348177566,111685352,36763757,538456609,398132380,772359180,356117401,136789192,465752518,485380569,217309884,866820964,454770476,120594119,543223813,873274961
            ]) {
                global.bot.sendMessage(u, 'Не забывайте приглашать друзей через страницу приглашений :)');
            }
        }, 10000);*/
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
        app.get('/writeTo', this._chatsController.writeTo.bind(this._chatsController));

        app.get('/events', this._eventsController.getPage.bind(this._eventsController));

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

            await this._saveChatId(msg, 'message');
            await this._parseAvatar(bot, msg);
            await bot.sendGame(chatId, 'fzWorldBot');
        });

        bot.on('callback_query', async callbackQuery => {
            const token = jwt.sign(callbackQuery.from, process.env.FZ_BOT_KEY);

            await this._saveChatId(callbackQuery, 'query');
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

    async _saveChatId(msg, from) {
        const user = await global.db.collection('users').findOne({ username: msg.from.username });

        if (user) {
            if (!msg.from.id) {
                console.log('Unknown user id!', from);
            }

            await global.db
                .collection('users')
                .updateOne({ username: msg.from.username }, { $set: { tgUserId: msg.from.id } });
        } else {
            await global.db.collection('users').insertOne({
                username: msg.from.username,
                tgUserId: msg.from.id,
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
        }
    }

    async _parseAvatar(bot, msg) {
        const user = await global.db.collection('users').findOne({ username: msg.from.username });

        if (user && !user.avatar) {
            const res = await bot.getUserProfilePhotos(msg.from.id);

            if (res.photos.length && res.photos[0][1].file_id) {
                const file = await bot.getFile(res.photos[0][1].file_id);
                const path = file.file_path;

                if (path) {
                    const key = process.env.FZ_BOT_KEY;

                    const result = await cloudinary.uploader.upload(
                        `https://api.telegram.org/file/bot${key}/${path}`
                    );

                    await global.db.collection('users').updateOne(
                        { username: msg.from.username },
                        {
                            $set: {
                                avatar: result.url,
                            },
                        }
                    );
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
