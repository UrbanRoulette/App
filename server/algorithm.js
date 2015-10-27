Meteor.startup(function(){
	//Parameters
	pace = 15; // Pace (in number of minutes) (must divide 60)
	unit = 1; //Unit for the last of each activity in database (in number of minutes)
	dayLength = 6*60;//6*60; //Length of day (in number of unit). Ex: If unit=30 (ie half-hour), then dayLength = 2 means 1 hour
	activitiesLength = 4; //Nb of activities in the roulette
	gap = dayLength; //Gap between two activities (in number of unit). During this gap, activity of the same category will not be offered, unless it has been randomly chosen more than var 'luck' times 
	transportation = 15; //TIme of transportation between two activities in number of 'units'
	luck = 5; //Number of tries from which an activity can appear even if it is redundant

	//Functions used in algorithm
	roundTime = function(date, pace){  
		var h = date.getHours();
		var m = date.getMinutes();
		var result = m/pace;
		var quotient = Math.floor(result);
		if((quotient + 1) === 60/pace)
			date.setHours(h+1,0,0,0); //Important to set seconds and milliseconds to 0!
		else 
			date.setHours(h,(quotient+1)*pace,0,0);
		return date;
	};

	timeString = function(time){
		var h = time.getHours();
		var m = time.getMinutes();
		var timeString = '';
		if (h>=10){
			if (m>=10)
				timeString = h.toString() + 'h' + m.toString();
			else
				timeString = h.toString() + 'h0' + m.toString();
		}
		else {
			if (m>=10)
				timeString = '0' + h.toString() + 'h' + m.toString();
			else
				timeString = '0' + h.toString() + 'h0' + m.toString();
		}
		return timeString;
	};

});

Meteor.methods({

	algorithm: function(){

		var center = {lat:48.8581638,lng:2.362247000000025};
		var radius = 3 / 3963.2; //Converts miles into radians
		var date_now = new Date();
		var start = roundTime(date_now,pace);
		var lat = center.lat;
		var lng = center.lng;
		var profile = "TestProfile";
		var requiresun = false;
		
		var types_excluded = [];
		var types_required = [];

		var track_results_id = [];
		var track_unwanted_id = [];
		var all_tests_passed = true;

		var results = [];

		while (results.length < activitiesLength){

			var hour = start.getHours();
			
			//FOR RESTAURANTS
			var typeTreated = 'restaurant';
			if (eatingHours.indexOf(hour) > -1)
				types_required.push(typeTreated);	
			else
				types_excluded.push(typeTreated);

			var query = {
						_id: { $not: { $in: track_results_id.concat(track_unwanted_id) } },
						index : { $geoWithin: { $centerSphere : [ [ lng, lat ] , radius ] } },
						type: { $in: types_required },
						type: { $not: { $in: types_excluded } }, // jshint ignore:line
						profile: { $in: [profile] },
//						startdate: {$lte: start}, //startdate is not always defined...
//						enddate: {$gt: start}, //enddate is not always defined...
						requiresun: requiresun,
						rand: { $gte: Math.random() },
					};

			var activity = Activities.findOne({$query: query, $orderby: { rand: 1 } } );

			//If there are tests
			if(all_tests_passed){
				results.push(activity);
				track_results_id.push(activity._id);
			}
			else {
				track_unwanted_id.push(activity._id);
			}
		}
		console.log(results);
		return results;
	},
});

