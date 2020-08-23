const displayDataDHT = () => {
	sensorDHT.read(22, 18, function(err, temperature, humidity) {
		if (!err) {
		} else {
			console.log(`An error occured: ${err}`);
		}
	});
}

const airPressure = (async () => {
    const bmp280 = new BMP280({
        bus: 1,
        address: 0x77
    });
 
    await bmp280.connect();
 
    const values = await bmp280.sensors();
    bmpTemperature = values.temperature;
    bmpPressure = values.pressure;
    
    // console.log(bmpTemperature);
    // console.log(bmpPressure);
 
    await bmp280.disconnect();
});


const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));

const http = app.listen(8080, () => console.log(`Server listening`));
const fs = require('fs'); //require filesystem module
const io = require('socket.io')(http) //require socket.io module and pass the http object (server)
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const Gpio4LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
const Gpio22ReedSwitch = new Gpio(22, 'in', 'both'); //use GPIO pin 22 as input, and 'both' open and closed doors can be handled
const sensorDHT = require('node-dht-sensor'); // setup DHT22 temperature/humidity sensor
const { BMP280 } = require('@idenisovs/bmp280'); // setup BMP280 temperature/ air pressure sensor
const request = require('request'); // setup scraping of a website for aquiring air pressure data
const nodemailer = require('nodemailer'); // require nodemailer for auto-sending e-mails

let bmpTemperature = 0;
let bmpPressure = 0;

const externalPage = "https://sussfelnap.hu/legnyomas/H%C3%B3dmez%C5%91v%C3%A1s%C3%A1rhely/";
const scrapingAddJS = "<script src='assets/scripts/scrapingGlue.js' defer></script></head>"
let scrapedPerssure = "";


// scraping external page for initial pressure data:
request(externalPage, function(err, res, body) {
  let fullBody = body;
  let temporaryBody = fullBody.split('class="temp homerseklet">')[1];
  scrapedPressure = temporaryBody.split('<span')[0];
  
});


// reed relay on front door sends an e-mail whenever the door is opened
Gpio22ReedSwitch.watch(function (err, value) { 
  if (err) {
    console.error('There was an error', err);
  return;
  }
  if (value == 0) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
      user: 'badgerraspberry@gmail.com',
      pass: 'B0rzetka'
      }
    });

    let mailOptions = {
      from: 'badgerraspberry@gmail.com',
      to: 'dotomiro2@gmail.com',
      subject: 'AJTÓ NYITVA',
      text: 'Halló lakótársaim!\n\nCsak szólok, hogy a bejárati ajtót kinyitották! Ha nem ti voltatok, én gyanakodnék ;)\n\nRaspberry'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
      }
    });
  } 
  
});


// use sockets.io for ability to turn lights on/off and dynamically display air quality data
io.sockets.on('connection', function (socket) {
  let lightvalue = 0;
  
  setInterval(function() {
      //scraping external page for pressure data:
      request(externalPage, function(err, res, body) {
        let fullBody = body;
        let temporaryBody = fullBody.split('class="temp homerseklet">')[1];
        scrapedPressure = temporaryBody.split('<span')[0];
      });
    
      //measuring temperature and humidity from indoor DHT22 sensor:
      sensorDHT.read(22, 18, function(err, temperature, humidity) {
        if (!err) {
          socket.emit('sensorInsideEvent', { tempIn: `${temperature.toFixed(2)}`, humidIn: `${humidity.toFixed(2)}`});
        } else {
          console.log(`An error occured reading the indoors sensor: ${err}`);
        }
      });
      
      //OUTDOOR SENSOR MALFUNCTIONING!
      //measuring temperature and humidity from outdoor DHT22 sensor:
      // sensorDHT.read(22, 27, function(err, temperature, humidity) {
      //   if (!err) {
      //     socket.emit('sensorOutsideEvent', { tempOut: `${temperature.toFixed(2)}`, humidOut: `${humidity.toFixed(2)}`, pressOut: `${scrapedPressure}`});
      //   } else {
      //     console.log(`An error occured reading the outdoors sensor: ${err}`);
      //   }
      // });
      
      socket.emit('sensorOutsideEvent', {pressOut: `${scrapedPressure}`});
      
   }, 10000);

  socket.on('light', function(data) {
    lightvalue = data;
    if (lightvalue != Gpio4LED.readSync()) {
      Gpio4LED.writeSync(lightvalue);
    }
  });
});

process.on('SIGINT', function () {
  Gpio4LED.writeSync(0);
  Gpio4LED.unexport();
  Gpio22ReedSwitch.unexport();
  process.exit();
});
