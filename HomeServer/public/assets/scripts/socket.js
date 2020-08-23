const socket = io(); //load socket.io-client and connect to the host that serves the page

const lightbox = document.getElementById("light");
const temperatureIndoors = document.getElementById("temperature-indoors");
const humidityIndoors = document.getElementById("humidity-indoors");
// const temperatureOutdoors = document.getElementById("temperature-outdoors");
// const humidityOutdoors = document.getElementById("humidity-outdoors");
const pressureOutdoors = document.getElementById("pressure-outdoors");

const degCelsius = " °C";
const percent = " %";
const milliBar = " mbar";


window.addEventListener("load", function(){ //when page loads
	lightbox.addEventListener("change", function() { //add event listener for when checkbox changes
		socket.emit("light", Number(this.checked)); //send button status to server (as 1 or 0)
	});
});
        
socket.on('light', function (data) { //get button status from client (NOT SERVER?!?)
	lightbox.checked = data; //change checkbox according to push button on Raspberry Pi
	socket.emit("light", data); //send push button status to back to server
});

socket.on('sensorInsideEvent', function(data){
    temperatureIndoors.innerHTML = `${data.tempIn} ${degCelsius}`;
    humidityIndoors.innerHTML = `${data.humidIn} ${percent}`;
});

socket.on('sensorOutsideEvent', function(data){
    // temperatureOutdoors.innerHTML = `${data.tempOut} ${degCelsius}`;
    // humidityOutdoors.innerHTML = `${data.humidOut} ${percent}`;
    pressureOutdoors.innerHTML = `${data.pressOut} ${milliBar}`;
});
