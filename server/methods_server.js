Meteor.methods({

	get_opening_hours_googleAPI: function(){
        this.unblock();
		Activities.find().forEach(function(doc){
		  var API_KEY = "AIzaSyDfc_LzQZwwLngNGjWFp74np2XpSx7_lBA";
		  var placeId = doc.placeId;
		  var URLrequest =  "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=" + API_KEY;
		  HTTP.call("GET", URLrequest,
		            function (error, response) {
		              if (error) {
		                console.log(error);
		              }
		              else {
		              	try {
						  opening_hours = response.data.result.opening_hours;
						}
						catch(e){
						  opening_hours = 'No result';
						}
						finally {
							if(typeof opening_hours !== "undefined")
					        	console.log(opening_hours);
					        else
					        	console.log("No opening_hours");
					    }
		              }
		            });
		}); 
    },


	insertActivity: function(doc){

	    check(doc, Object);
	    check(doc.requiresun, Boolean);
	    check(doc.last, Number);
	    check(doc.temporary, Boolean);
	    check(doc.startdate, Match.Optional(Date));
	    check(doc.enddate, Match.Optional(Date));
	    check(doc.yearperiodic, Match.Optional(Boolean));
	    check(doc.longUrl, String);
	    check(doc.submitted, Date);		

	    var response = HTTP.call('POST',
	    					'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyAdjMwL0vrhXn00TKLGgfII6ET0sNsEa8E',{
	    						data: {longUrl: doc.longUrl},
	    						headers: {contentType: 'application/json; charset=utf-8',
	    									dataType: 'json'
	    						}
	    					}	
				   	);
	    doc.link = response.data.id;

	    doc.index = Meteor.call('createIndex',doc.district,doc.type);

	    Activities.insert(doc);

	    if(doc.type === "Musée"){
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
	    	else {
	    		Museums.update({key_name: key_name}, {$set: {address: doc.address}});
	    		Museums.update({key_name: key_name}, {$set: {district: doc.district}});
	    		Museums.update({key_name: key_name}, {$set: {contact: doc.contact}});
	    		Museums.update({key_name: key_name}, {$set: {metrostation: doc.metrostation}});
	    		Museums.update({key_name: key_name}, {$set: {monday: doc.monday}});
	    		Museums.update({key_name: key_name}, {$set: {tuesday: doc.tuesday}});
	    		Museums.update({key_name: key_name}, {$set: {wednesday: doc.wednesday}});
	    		Museums.update({key_name: key_name}, {$set: {thursday: doc.thursday}});
	    		Museums.update({key_name: key_name}, {$set: {friday: doc.friday}});
	    		Museums.update({key_name: key_name}, {$set: {saturday: doc.saturday}});
	    		Museums.update({key_name: key_name}, {$set: {sunday: doc.sunday}});
	    	}
	    }
	}
});