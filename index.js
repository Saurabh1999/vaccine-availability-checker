const fetch = require("node-fetch");
const nodemailer = require('nodemailer');
const express = require('express');
const moment = require('moment');
const port = process.env.PORT || 80;
const app = express();

function processRequest() {
  let finalResponse = [];
  return fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=624&date=${moment().format('DD-MM-YYYY')}`, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
      "sec-ch-ua-mobile": "?0",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors"
  })
    .then((response) => response.json())
    .then((data) => {
      let availableCenters = data && data.centers ? data.centers : [];
      let freeAvailableCenters = availableCenters.filter((availableCenter) => {
        return availableCenter['fee_type'].toLowerCase() == 'free';
      });
      freeAvailableCenters.forEach((availableCenter) => {
        let covaxinSessions = availableCenter.sessions.filter(session => session.vaccine == 'COVISHIELD' && session.available_capacity_dose2 > 0 && session.min_age_limit == 18);
        if (covaxinSessions.length > 0) {
          finalResponse.push(availableCenter);
        }
      })
      if (finalResponse.length > 0) {
        return sendEmail(JSON.stringify(finalResponse, null, 2));
      }
      return Promise.resolve();
    })
    .then(() => {
      let dateObj = new Date();
      return Promise.resolve({
        finalResponse,
        dateText: dateObj.toDateString(),
        timeText: dateObj.toTimeString()
      })
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
    });
}




function sendEmail(message) {
  return new Promise((resolve, reject) => {
    let mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'singh.shubham19932@gmail.com',
        pass: 'Saurabh1729*'
      }
    });

    let mailDetails = {
      from: 'singh.shubham19932@gmail.com',
      to: 'singh.saurabh1997@gmail.com',
      subject: 'Vaccine center available',
      text: message
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log('err', err);
        return reject(err);
      } else {
        console.log('Email sent successfully');
        return resolve();
      }
    });
  })

}

app.get('/', (req, res) => {
  processRequest()
    .then((data) => {
      res.send(data);
    })
})

app.listen(port, () => {
  console.log(`vaccine web app listening at http://localhost:${port}`)
})
