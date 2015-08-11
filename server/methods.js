Meteor.methods({

	createIndex: function(district,type){

		check(district, Number);
		check(type, String);

		var district_str = (district < 10) ? '0' + district : district.toString();

		var typeNb = types.indexOf(type);
		var typeNb_str = (typeNb < 10) ? '0' + typeNb : typeNb.toString();

		var number = Activities.find({$and: [{district: district}, {type: type}]}).count();

		var index = parseInt((number + 1).toString() + typeNb_str + district_str);

		return index;
	},

	insertActivity: function(doc){

		console.log(doc);
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
	}
});
