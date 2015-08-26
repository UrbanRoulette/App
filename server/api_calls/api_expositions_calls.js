Meteor.startup(function(){

//	Activitieswaiting.remove({});
//	Activitiesdiscarded.remove({});
/*
	var parisbougeCall = HTTP.call('GET',"https://www.kimonolabs.com/api/1x38r1y8?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI&kimmodify=1");
	var test = parisbougeCall.data;
//	var offiCall = HTTP.call('GET',"https://www.kimonolabs.com/api/307rr4b6?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI&kimmodify=1");
//	var test = offiCall.data;
	for(k=0; k < test.length; k++){
		var obj = {};
		for(var key in test[k])
			obj[key] = test[k][key];
		obj.source = "ParisBouge";
		obj.type = "Musée";
		obj.last = "1h30";
		var key_name;
		if(typeof obj.name !== 'undefined')
			key_name = obj.name.toLowerCase().replace(/é|è|ê/g,'e').replace(/ô/,'o').replace(/ |-|,|:/g,'');
		var doc = Museums.findOne({key_name: key_name});
		if(typeof doc !== 'undefined'){
			obj.address = doc.address;
			obj.district = doc.district;
			obj.contact = doc.contact;
			obj.metrostation = doc.metrostation;
			obj.monday = doc.monday;
			obj.tuesday = doc.tuesday;
			obj.wednesday = doc.wednesday;
			obj.friday = doc.friday;
			obj.saturday = doc.saturday;
			obj.sunday = doc.sunday;
		}
		if(!Activities.findOne({longUrl: obj.longUrl}) && !Activitiesdiscarded.findOne({longUrl: obj.longUrl}))
			Activitieswaiting.insert(obj);
	}
*/

//To create MUSEUMS database
/*
	Museums.remove({});
	Activities.find({type: "Musée"}).forEach(function(doc){
		var key_name = doc.name.toLowerCase().replace(/é|è|ê/g,'e').replace(/ô/,'o').replace(/ |-|,|:/g,'');
		if(!Museums.findOne({key_name: key_name})){
			var obj = {};
			obj.name = doc.name;
			obj.key_name = key_name;
			obj.address = doc.address;
			obj.district = doc.district;
			obj.contact = doc.contact;
			obj.metrostation = doc.metrostation;
			obj.monday = doc.monday;
			obj.tuesday = doc.tuesday;
			obj.wednesday = doc.wednesday;
			obj.thursday = doc.thursday;
			obj.friday = doc.friday;
			obj.saturday = doc.saturday;
			obj.sunday = doc.sunday;
			Museums.insert(obj);
		}
	});
	console.log('MUSEUMS  ',Museums.find().count());
*/
});