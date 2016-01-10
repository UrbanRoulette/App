Meteor.methods({

	get_weather: function(center){
		var URLrequest =  "http://api.openweathermap.org/data/2.5/weather?lat=" + center.lat + "&lon=" + center.lng + "&APPID=c8c3d5213625cfb230413935cb2ee5e9";
		var weatherId = HTTP.call("GET", URLrequest).data.weather[0].id;
		var weather;
		if([600,801].indexOf(weatherId) > -1) weather = "sun";
		else if([802,803,804].indexOf(weatherId) > -1) weather = "clouds";
		else weather = "rain";
		return weather;
    },

  	convert_date_to_readable_string: function(date){
  	  date = new Date(date);
      var h = date.getHours();
      var m = date.getMinutes();
      var hh = (h>=10) ? '' : '0';
      var mm = (m>=10) ? 'h' : 'h0';
      var readable_string = hh + h.toString() + mm + m.toString();    
      return readable_string;
    },
	
	createString: function(obj){
        var carditem = '\n';
        var start_string = Meteor.call('convert_date_to_readable_string',obj.start_date);
        var end_string = Meteor.call('convert_date_to_readable_string',obj.end_date);

        carditem += start_string + "-" + end_string + " : " + obj.specific + " - " + obj.price + '€\n';
        carditem += obj.name + ' - ' + obj.district +'e';
        carditem += '\n';
        carditem += (obj.metrostation !== null) ? ('Métro : ' + obj.metrostation + '\n') : '';
        carditem += '+ d\'infos : ' + obj.link;
        carditem += '\n';

     	return carditem;
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