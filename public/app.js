//envoie des données sur l'arduino

const { SerialPort } = require("serialport"); // bibliotheque Serialport

const port = new SerialPort({ path: "/dev/ttyACM0", baudRate: 9600 });
// pour le port série Windows : "COM3" / macOS : "/dev/tty.usbmodemXXXX"

//ouverure du port
port.on("open", () => {
  setTimeout(() => port.write("1"), 2000); // allume la led 13
  setTimeout(() => port.write("0"), 4000); // éteint la led 14
  
});



// lit les données qui viennent de l'arduino
const { ReadlineParser } = require("@serialport/parser-readline"); // bibliotheque

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" })); // transforme et traduit
parser.on("data", (ligne) => console.log("Reçu :", ligne)); //écrit dans le terminale
