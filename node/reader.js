var fs = require('fs');

var filename = process.argv[2];

var msdsOntName = ":" + filename.split(".")[0].toUpperCase()
console.log(msdsOntName);
var lineReader = require('line-reader');


var Flammability = "";
var Reactivity = "";
var Health = "";
var Fire = "";
var Flashpoint = "";
var CommonName = "";
var Manufacturer = "";

var ttlBody = "@prefix : <"+filename.split('.')[0]+".ttl#> .";
ttlBody += "\n@prefix msds: <http://github.com/dickmanben/cse551/msds.ttl#> .";
ttlBody += "\n\n" + msdsOntName + " a msds:MSDS .";

lineReader.eachLine(filename, function (line, last) {
	str = line;
	if(str.search(/(non-Flammab|Flammab)(le|ility)( )*(0|.* not .* combust(ion)*)/i) > -1) {
		ttlBody += "\n" + Flammability;
		if(Flammability.length == 0){
			Flammability = (Flammability.length == 0) ? msdsOntName + " msds:Flammability  \"0\" ." : Flammability;
			ttlBody += "\n" + Flammability;
		}
		console.log(Flammability)
	}
	if(str.search(/^(flammability).*([0-9])/i) > -1) {
		num = str.match(/[0-9]/)[0];
		if(Flammability.length == 0){
			Flammability = (Flammability.length == 0) ? msdsOntName + " msds:Flammability \"" + num + "\" ." : Flammability;
			ttlBody += "\n" + Flammability;
		}
		console.log(Flammability)

	}
	if(str.search(/(REACTIVITY).{0,5}:*.{0,5}[0-9].*/i) > -1) {
		if(Reactivity.length == 0){
			num = str.match(/[0-9]/)[0];
			Reactivity = (Reactivity.length == 0) ? msdsOntName + " msds:Reactivity \"" + num + "\" ." : Reactivity;
			ttlBody += "\n" + Reactivity;
		}

		console.log(Reactivity)
	}
	if(str.search(/(health).*[0-9]/i) > -1) {
		if(Health.length == 0){
			num = str.match(/[0-9]/)[0];
			Health = (Health.length == 0) ? msdsOntName + " msds:Health \"" + num + "\" ." : Health;
			ttlBody += "\n" + Health;
		}

		console.log(Health)
	}
	if(str.search(/^(trade|common)( )*(name)*.*/i) > -1) {
		str = str.split(":")[1]
		CommonName = (CommonName.length == 0) ? msdsOntName + " msds:CommonName \"" + str.trim() + "\" ." : CommonName;
		ttlBody += "\n" + CommonName;

		console.log(CommonName)
	}
	if(str.search(/^(company|manufacturer).*/i) > -1) {
		str = str.split(":")[1]
		Manufacturer = (Manufacturer.length == 0) ? msdsOntName + " msds:Manufacturer \"" + str.trim() + "\" ." : Manufacturer;
		ttlBody += "\n" + Manufacturer;

		console.log(Manufacturer)
	}
	if(str.search(/(fire).{0,5}(hazard)*:+?.{0,5}[0-9].*/i) > -1) {
		if(Fire.length == 0){
			num = str.match(/[0-9]/)[0];
			Fire = (Fire.length == 0) ? msdsOntName + " msds:Fire \"" + num + "\" ." : Fire;
			ttlBody += "\n" + Fire;
		}
		
		console.log(Fire)
	}
	if(str.search(/^(flash point).*([0-9].*(f|c)(\))+?|not.*)/i) > -1) {
		if(Flashpoint.length == 0){
			if(str.indexOf("Note:") > -1) {
				str = str.split(":")[2]
			} else {
				str = str.split(":")[1]

			}
			Flashpoint = (Flashpoint.length == 0) ? msdsOntName + " msds:Flashpoint \"" + str.trim() + "\" ." : Flashpoint;
			ttlBody += "\n" + Flashpoint;
			console.log(Flashpoint)

		}
	}
	if(last){
		writeFile(ttlBody);
	}
});




var writeFile = function(body){

	fs.writeFile(filename.split(".")[0]+".ttl", body, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	});
}

/*
Non Flammable

(non-Flammab|Flammab)(le|ility)( )*(0|.* not .* combust(ion)*)


HMIS

Flammability
^(flammability).*([0-9])

Reactivity
^(reactive|reactivity).*[0-9]


Health
^(health).*[0-9]


Common Name
^(trade|common)( )*(name)*.*


Company/Manufacturer
^(company|manufacturer).*


NFPA

Fire
(fire).{0,5}(hazard)*:+?.{0,5}[0-9].*
^(fire).*[0-9]

Reactivity
(REACTIVITY).{0,5}*:+?.{0,5}[0-9].*
^(reactive|reactivity).*[0-9]


Health
^(health).*[0-9]


Flash Point
^(flash point).*[0-9].*(f|c)(\))+?
^(flash point).*

*/
