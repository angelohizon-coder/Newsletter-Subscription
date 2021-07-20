const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
// external module required for favicon.ico
const favicon = require('serve-favicon')
const path = require('path')

const app = express();

// for some reason this allows the use of CSS
app.use(express.static(__dirname));
// takes the favicon from the directory
app.use(favicon(__dirname + "/images/favicon/favicon.ico"));
app.use(bodyParser.urlencoded( {extended:true} ));

app.listen(process.env.port || 3000, function() {
  console.log("Server is running");
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  // format that needs to be passed to MonkeyChimp
  // simply send as JSON format
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  // wraps the JSON to be sent
  const jsonDATA = JSON.stringify(data);
  // endpoint & path
  const url = "https://us6.api.mailchimp.com/3.0/lists/d6cceeb6e0";
  // type of request sent to MonkeyChimp
  const options = {
    method: "POST",
    auth: "angelo:03f0dc0a0a4949af89ee74ac482b04f0-us6"
  };

  // store the request to a variable so that it can be reused later on
  // from my understanding it saves the stream of data(hexadecimal not yet parsed) that was sent back from MailChimp
  const request = https.request(url, options, function(response) {
    response.on("data", function(data) {
      const subscriberData = JSON.parse(data);
      const errorCount = Number(subscriberData.error_count);
      const status = Number(response.statusCode);

      // THIS COMMENTS ARE USED FOR ERROR CHECKING **DO NOT DELETE**
      // const error = subscriberData.errors[0].error;
      // const errorSplit = error.split(",");
      // console.log(errorSplit[0]);
      // console.log(response.statusCode);
      // console.log(subscriberData);

      if(status === 200 && errorCount === 0) {
        res.sendFile(__dirname + "/success.html");
      }
      else {
        res.sendFile(__dirname + "/failure.html");
      }
    })
  });

  request.write(jsonDATA);
  request.end();
});

app.get("/failure", function(req, res){
  // res.sendFile(__dirname + "/signup.html");
  res.redirect("/");
});

app.get("/success", function(req, res){
  res.sendFile(__dirname + "/signup.html");
});
