var express = require('express');
var app = express();
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser')
var lineReader = require('line-reader');
var PDFParser = require("pdf2json");
const fileUpload = require('express-fileupload');
let pdfParser = new PDFParser(this,1);
ObjectID = require('mongodb').ObjectID


var url = 'mongodb://localhost:27017/serp';

app.use(bodyParser.json())
app.use(fileUpload());

app.post('/Sensor', function (req, res) {
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);

	  insertDocument(db, "sensors", req.body, function(err, result) {
  		assert.equal(err, null);
  	    console.log("Inserted a document into the sensor collection.");
  	    res.end("Result: " + result);
		db.close();
	  });
	});
})


app.post('/Room', function (req, res) {
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);

	  insertDocument(db, "rooms", req.body, function(err, result) {
  		assert.equal(err, null);
  	    console.log("Inserted a document into the rooms collection.");
  	    res.end("Result: " + result);
		db.close();
	  });
	});
})



app.get("/Room/:id", function(req,res){
	id = parseInt(req.params.id)
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
  		db.collection("rooms").find({"entryId":id}).toArray(function(err, result){
  			if(err != null){
  				res.end("failed " + err);
  			} else {
  				console.log(result);
  				console.log("Found a document from the rooms collection. id = " + req.params.id);
  				res.end(JSON.stringify(result))
  			}

  		});
		db.close();
	});
});


app.get("/Ratings:id",function(req,res){
	id = parseInt(req.params.id);
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection("ratings").find({"roomId":id}).toArray(function(err, result){
			if(err != null){
				res.end("failed " + err);
			} else {
				console.log(result);
				console.log("Found a document from the rooms collection. id = " + req.params.id);
				res.end(JSON.stringify(result))
			}
		});
		db.close();
	});
});


app.get("/Status/:id", function(req,res){
	id = parseInt(req.params.id);
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		db.collection("rooms").find({"entryId":id}).toArray(function(err, result1){
			if(err != null){
						console.log(result1);
						res.end("failed " + err);
					} else {
			db.collection("sensors").find({"roomId":id}).toArray(function(err, result2){
				if(err != null){
						console.log(result2);
						res.end("failed " + err);
					} else {
				db.collection("ratings").find({"roomId":id}).toArray(function(err, result3){
					if(err != null){
						res.end("failed " + err);
					} else {
						console.log(result3);
						console.log("Found a document from the rooms collection. id = " + req.params.id);
						res.jsonp([result1,result2,result3])
					}

				});
			}
			});
		}
		});
	});
});

app.post('/MSDS/:id', function(req,res){

	id = parseInt(req.params.id);

	msdsFile = req.files.msds; 

	msdsFile.mv(req.files.msds.name, function(err) {
	    if (err)
	      return res.status(500).send(err);
		parsePDF(id, req.files.msds.name, readTxt);
	 	
	    res.send('File uploaded!');
	  });

})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})

// var insertRatings = function(filename, id, ratings){
// 	var msdsOntName = ":" + filename.split(".")[0].toUpperCase()
// 	var Flammability =ratings[0];
// 	var Reactivity = ratings[1];
// 	var Health = ratings[2];
// 	var Fire = ratings[3];
// 	var Flashpoint = ratings[4];

// 	Flammability = Flammability.replace(msdsOntName + " msds:Flammability", "").replace(/\"/g,"").trim();
// 	Reactivity = Reactivity.replace(msdsOntName + " msds:Reactivity", "").replace(/\"/g,"").trim();
// 	Health = Health.replace(msdsOntName + " msds:Health", "").replace(/\"/g,"").trim();
// 	Fire = Fire.replace(msdsOntName + " msds:Fire", "").replace(/\"/g,"").trim();
// 	Flashpoint = Flashpoint.replace(msdsOntName + " msds:Flashpoint", "").replace(/\"/g,"").trim();



// 	var ratingObj = {
// 		"Flammability":Flammability,
// 		"Reactivity":Reactivity,
// 		"Health":Health,
// 		"Fire":Fire,
// 		"Flashpoint":Flashpoint,
// 		"FileName":filename,
// 		"roomId": id
// 	}
// 	MongoClient.connect(url, function(err, db) {
// 	  assert.equal(null, err);
// 	  insertDocument(db, "ratings",  ratingObj, function() {
// 	      db.close();
// 	      ratingObj = null;
// 	  });
// 	});


// 	console.log("msdsOntName: " + msdsOntName + "Flammability: " + Flammability + "Reactivity:  " + Reactivity + "Health:  " + Health + "Fire:  " + Fire + "Flashpoint:  " + Flashpoint );
// }



var insertDocument = function(db, collection, body, callback) {
	db.collection(collection).count(function(err, count) {
	  	body.entryId = count;
	  	db.collection(collection).insertOne(body, function(err, result){
	  		assert.equal(err, null);
	  	    console.log("Inserted a document into the restaurants collection.");
	  	    callback(err, result);
	  	})
      });	

}


function parsePDF(id, filename, callback){
	filenameText = filename.split(".")[0] + ".txt";

	pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
	pdfParser.on("pdfParser_dataReady", pdfData => {
	    fs.writeFile(filenameText,pdfParser.getRawTextContent(), function(){
	    	
	    	callback(id, filenameText);
	    } );
	});

	pdfParser.loadPDF(filename);
	
}




function readTxt(id, filename){

var msdsOntName = ":" + filename.split(".")[0].toUpperCase()


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
		ratings = [Flammability, Reactivity, Health, Fire, Flashpoint];
		writeTtlFile(filename, ttlBody, ratings, id);
	}
});
}



var writeTtlFile = function(filename, body, ratings, id){

	fs.writeFile(filename.split(".")[0]+".ttl", body, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    // insertRatings(filename, id, ratings);
	    console.log("The file was saved!");
	});
}
