let express = require("express")
let request = require("request")
let querystring = require("querystring")
require("dotenv").config()

let app = express()

let redirect_uri = "https://spotify-back-end.herokuapp.com/callback"

app.get("/login", function(req, res) {
  res.redirect("https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: "user-read-private user-read-email user-follow-read user-read-recently-played",
      redirect_uri
    }))
})

app.get("/callback", function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri,
      grant_type: "authorization_code"
    },
    headers: {
      "Authorization": "Basic " + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
      ).toString("base64"))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    let access_token = body.access_token
    let uri = process.env.FRONTEND_URI || "https://music-and-cocktails.firebaseapp.com"
    res.redirect(uri + "?access_token=" + access_token)
  })
})

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)