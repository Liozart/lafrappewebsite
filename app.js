const port = 3000;
const dbName = "lafrappeshipdb";
const dbIp = "localhost:27017";
const collectionNameCommandsWaiting = "waiting";
const collectionNameCommandsDone = "done";

const express = require('express');
const app = express();
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

//DB
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://" + dbIp + "/";

//Mail sender
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'lafrappenoreply@gmail.com',
      pass: 'bathrakasi'
    }
  });

//Create waiting commands and done collection
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);
    dbo.createCollection(collectionNameCommandsWaiting, function(err, res) {
      if (err) throw err;
      console.log("Waiting created!");
      dbo.createCollection(collectionNameCommandsDone, function(err, res) {
        if (err) throw err;
        console.log("Done created!");
        db.close();
      });
    });
});

//Webiste serving
app.use(express.static('lafrappewebsite'));
app.get('/', (req, res) => {
  res.sendFile("index.html");
});

//API calls
//post a new command
app.post("/add", jsonParser, (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        //Add commands infos to the db
        dbo.collection(collectionNameCommandsWaiting).insertOne(req.body, function(err, res) {
          if (err) throw err;
            console.log("A new command was added.");
            //Send email to the user
            var mailOptions = {
                from: 'lafrappenoreply@gmail.com',
                to: req.body.email,
                subject: 'Commande réussie',
                text: 'Votre commande a bien été envoyée à La Frappe Society. Elle sera ' +
                'expédiée dans les plus brefs délais. '
              };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  res.status(200).send();
                }
              });
          db.close();
        });
    });
});

//Retrieve the waiting commands
app.get("/get", (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        dbo.collection(collectionNameCommandsWaiting).find({}).toArray(function(err, result) {
          if (err) throw err;
          res.send(result);
          db.close();
        });
    });
});

//Mark a command as done
app.post("/done", jsonParser, (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        var query = { _id : req.body._id };
        //Retrieve command
        dbo.collection(collectionNameCommandsWaiting).findOne(query, function(err, obj) {
            if (err) throw err;
            //Add to done list
            dbo.collection(collectionNameCommandsDone).insertOne(obj, function(err, obj2) {
                if (err) throw err;
                console.log("Command added to done");
                //Remove from waiting list
                dbo.collection(collectionNameCommandsWaiting).deleteOne(query, function(err, obj3) {
                    if (err) throw err;
                    console.log("Command removed");
                    db.close();
                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
  });