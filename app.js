const port = 3000;
const dbName = "lafrappeshipdb";
const dbIp = "localhost:27017";
const collectionNameCommandsWaiting = "waiting";
const collectionNameCommandsDone = "done";
const merch = require("./merch");

const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

//DB
var MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb');
var url = "mongodb://" + dbIp + "/";

var date = new Date();

//Mail sender
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'lafrappenoreply@gmail.com',
      pass: 'bathrakasi'
    }
  });

  //Payment
  const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");

//Allow cross-platform requesting
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Create waiting commands and done collection
/*MongoClient.connect(url, function(err, db) {
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
});*/

//Website serving -----------------------
app.use(express.static('lafrappewebsite'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/lafrappewebsite/kentusfolio.html");
});

//Payment API -----------------------
/*app.post("/create-payment-intent", jsonParser, async (req, res) => {
  var c = parseFloat(req.body.price);
  console.log(c);
  c = c * 100;
  console.log(c);
  const price = c;
  console.log("net : " + price);
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price,
    currency: "chf"
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

//Commands management API -----------------------
//post a new command
app.post("/add", jsonParser, (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);
        //Add the state
        req.body.state = "wait";
        req.body.date = date.getDate().toString() + "/" + 
        (date.getMonth() + 1).toString() + "/" + date.getFullYear().toString();
        console.log(req.body.date);
        //Add commands infos to the db
        dbo.collection(collectionNameCommandsWaiting).insertOne(req.body, function(err, result) {
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
                  res.status(200).send("Ok");
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
        var query = { state : /wait|inprogress/ };
        dbo.collection(collectionNameCommandsWaiting).find(query).toArray(function(err, result) {
            if (err) throw err;
            //Add articles names with the quantites
            result.forEach(function(item, index) {
              var cmdToString = "";
                item.articles.forEach(function(num, index) {
                    if (num > 0){
                        cmdToString += num + "x " + merch[index].name + ", ";
                    }
                });
                cmdToString = cmdToString.slice(0, cmdToString.length-2);
                item.toString = cmdToString;
            });
            res.send({commands: result});
            db.close();
        });
    });
});

//Mark the command as done
app.post("/done", jsonParser, (req, res) => {
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var query = { _id :mongo.ObjectId(req.body._id)};
      //Retrieve command
      dbo.collection(collectionNameCommandsWaiting).findOne(query, function(err, obj) {
          if (err) throw err;
          //Mark as done
          obj.state = "done";
          //Send mail to client
          var mailOptions = {
            from: 'lafrappenoreply@gmail.com',
            to: obj.email,
            subject: 'Commande envoyée',
            text: 'Votre commande a été expédiée. '
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          //Add to done list
          dbo.collection(collectionNameCommandsDone).insertOne(obj, function(err, obj2) {
              if (err) throw err;
              console.log("Command added to done list");
              //Remove from waiting list
              dbo.collection(collectionNameCommandsWaiting).deleteOne(query, function(err, obj3) {
                  if (err) throw err;
                  console.log("Command removed from wait list");
                  res.status(200).send("Ok");
                  db.close();
              });
          });
      });
  });
});

//Mark a command as in progress
app.post("/inprogress", jsonParser, (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(dbName); 
        var query = {_id : mongo.ObjectId(req.body._id)};
        //Mark as in progress
        dbo.collection(collectionNameCommandsWaiting).updateOne(query, 
          {$set: {state: "inprogress" }}, function(err, result) {
          if (err) throw err;
          console.log("A command is in progress");
          res.status(200).send("Ok");
          db.close();
        });
    });
});*/

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
  });
