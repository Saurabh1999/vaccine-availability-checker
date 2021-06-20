const fetch = require("node-fetch");
const nodemailer = require('nodemailer');
const express = require('express')
const port = 3000;


function processRequest() {
  return fetch("https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=624&date=20-06-2021", {
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
      console.log(JSON.stringify(data, null, 2));
      let availableCenters = data && data.centers ? data.centers : [];
      let freeAvailableCenters = availableCenters.filter((availableCenter) => {
        return availableCenter['fee_type'].toLowerCase() == 'free';
      });
      let finalResponse = [];
      freeAvailableCenters.forEach((availableCenter) => {
        let covaxinSessions = availableCenter.sessions.filter(session => session.vaccine == 'COVAXIN' && session.available_capacity_dose2 > 0 && session.min_age_limit == 18);
        if (covaxinSessions.length > 0) {
          finalResponse.push(availableCenter);
        }
      })
      let dateObj = new Date();
      console.log('finalResponse', finalResponse, dateObj.toDateString(), dateObj.toTimeString());
      if (finalResponse.length > 0) {
        sendEmail(JSON.stringify(finalResponse, null, 2));
      }
    })
    .catch((err) => {
      console.error(err);
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

processRequest();


// app.get('/', (req, res) => {
  // processRequest()
  //   .then(() => {
  //     res.send('processed successfully');
  //   })
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })
