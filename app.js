const express = require("express");
const app = express();
const mongoose = require("mongoose");
var cron = require("node-cron");
var { v4: uuidv4 } = require("uuid");
const bodyparser = require("body-parser");
const Remainder = require("./models/remainder");
var cors = require("cors");
const nodemailer = require("nodemailer");
const remainder = require("./models/remainder");
const PORT = process.env.PORT || 9000;
let statusUpdate = 1;
require("dotenv").config();
app.use(cors());
app.use(bodyparser());
app.use(express.json());
mongoose
  .connect(
    `mongodb+srv://Admin:H1nZbhTiIGoAJdly@cluster0.aclj0.mongodb.net/SaaS?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    return console.log(`DB CONNECTED ✔️`);
  })
  .catch(() => {
    return console.log("Error Connecting DB...!");
  });

app.post("/addremainder", (req, res) => {
  console.log(req.body);
  const { title, message, sendTimer, emailId, phone } = req.body;
  //   console.log(err);
  if (!req.body) {
    return res.status(422).json({
      error: "Missing Body",
    });
  } else if (!title) {
    return res.status(400).json({ error: "Missing Field Title" });
  } else if (!message) {
    return res.status(400).json({ error: "Missing Field Message" });
  } else if (!sendTimer) {
    return res.status(400).json({ error: "Missing Field Send Timer" });
  } else if (!emailId) {
    return res.status(400).json({ error: "Missing Field Email Id" });
  } else {
    const remainder = new Remainder({
      title: title,
      message: message,
      sendTimer: sendTimer,
      emailId: emailId,
      phone: phone,
      createdOn: new Date().getTime(),
      modifiedOn: 0,
      status: false,
      userId: uuidv4(),
    });
    remainder.save((err, response) => {
      sendNotifications.start();
      return res.send(response);
    });
  }
});

app.get("/addremainder", (req, res) => {
  Remainder.find({}, (err, response) => {
    res.json(response);
  });
});

app.put("/addremainder/:id", (req, res) => {
  console.log(req.params.id);
  const { emailId, phone, title, message, sendTimer } = req.body;
  console.log(req.body);
  Remainder.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        emailId: emailId,
        phone: phone,
        title: title,
        message: message,
        sendTimer: sendTimer,
        modifiedOn: new Date().getTime(),
        status: false,
      },
    },
    { new: false, useFindAndModify: true },
    (err, response) => {
      console.log(err);
      res.json(response);
    }
  );
});

app.delete("/addremainder/:id", (req, res) => {
  Remainder.findByIdAndDelete({ _id: req.params.id }, (err, resp) => {
    res.send("User Deleted");
  });
});

// Scheduler Job

let sendNotifications = cron.schedule("* * * * * *", () => {
  remainder.find({ status: false }, async (err, data) => {
    if (data.length === 0) {
      console.log("1");
      sendNotifications.stop();
      return "Ended";
    } else {
      console.log();
      data.map((user, index) => {
        if (new Date(user.sendTimer).getTime() <= new Date().getTime()) {
          sendEmail(user);
        } else {
          console.log("Execuite after some time");
        }
      });
      statusUpdate = 0;
    }
  });
});

const sendEmail = (data) => {
  console.log(data);
  Remainder.findByIdAndUpdate(
    { _id: data.id },
    {
      $set: {
        status: true,
      },
    },
    { new: true, useFindAndModify: false },
    (err, response) => {
      console.log(response);
      message = {
        from: "k.giridharkrishna@gmail.com",
        to: `${response.emailId}`,
        subject: "Remainder",
        text: `Hi ${response.emailId} You have an remainder with title ${response.title} and the message is ${response.message}`,
      };
      mail(message);
    }
  );
};
if (statusUpdate === 0) sendNotifications.stop();

let transporter = nodemailer.createTransport({
  host: "smtp.mandrillapp.com",
  port: 587,
  auth: {
    user: "GiridharKrishna",
    pass: "57WGtX4BBIGZv7yp9MHXHg",
  },
});

const mail = (message) => {
  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

app.listen(PORT, () => {
  console.log(`Server is up and running at PORT:${PORT}`);
});
