const pug = require('pug');
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const uiPath = __dirname + '/ui/pages/';

app.use(express.static(__dirname + '/static'));

app.get('/', profile);
app.get('/profile.html', profile);
app.get('/editProfile.html', editProfile);
app.get('/join.html', join);
app.get('/search.html', search);

app.listen(port, () => console.log(`On port ${port}!`));

function profile(req, res) {
    res.send(pug.renderFile(`${uiPath}profile.html`, {}));
}

function editProfile(req, res) {
    res.send(pug.renderFile(`${uiPath}editProfile.html`, {}));
}

function join(req, res) {
    res.send(pug.renderFile(`${uiPath}join.html`, {}));
}

function search(req, res) {
    res.send(pug.renderFile(`${uiPath}search.html`, {}));
}

function unregistered(req, res) {
    res.send(pug.renderFile(`${uiPath}unregistered.html`, {}));
}
