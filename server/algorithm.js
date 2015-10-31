Meteor.startup(function(){
	//Vocabulary
/*	Any variable with "date" is a Date Object
	Any variable with "hour" is looking like 1830 (hour_integer) or "1830" (hour_string)
	Any variable with "time" is an amount of time (usually minutes)
*/	
	//Parameters
	pace = 5; // Pace (in number of minutes) (must divide 60)
	unit = 1; //Unit for the last of each activity in database (in number of minutes)
	roulette_time_amount = 6*60;//6*60; //Length of day (in number of unit). Ex: If unit=30 (ie half-hour), then dayLength = 2 means 1 hour
	activities_length = 4; //Max number of activities in the roulette
	gap = roulette_time_amount; //Gap between two activities (in number of unit). During this gap, activity of the same category will not be offered, unless it has been randomly chosen more than var 'luck' times 
	transportation = 15; //TIme of transportation between two activities in number of 'units'
	luck = 5; //Number of tries from which an activity can appear even if it is redundant

	//Functions used in algorithm
	round_date_to_pace_date = function(date, pace){  
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
	convert_date_to_hour_string = function(date){
		var h = date.getHours();
		var m = date.getMinutes();
		var hh = (h>=10) ? '' : '0';
		var mm = (m>=10) ? '' : '0';
		var hour_string = hh + h.toString() + mm + m.toString();		
		return hour_string;
	};
	convert_date_to_hour_integer = function(date){
		return parseInt(convert_date_to_hour_string(date));
	};
	convert_hour_string_to_date = function(hour_string){
		var date_now = new Date();
		var h = parseInt(hour_string.substr(0,2));
		var m = parseInt(hour_string.substr(2,2));
		date_now.setHours(h,m,0,0);

	};
	exclude_types = function(types_considered)	{	
		for(k=0; k < activity_types.length; k++){
			if(types_considered.indexOf(activity_types[k]) > -1)
				types_excluded.push(activity_types[k]);
		}
	};
	round_integer_to_pace_superior = function(int){
		var result = int/pace;
		var quotient = Math.floor(result);
		return pace * (quotient + 1); //returns a number of minutes
	};
	determine_flexibility_amount = function(last_object,total_lag){
		var possible_time_flexibility_for_activity = last_object.value * last_object.flexibility;
		var share_in_total_flexibility = possible_time_flexibility_for_activity / total_possible_time_flexibility;
		var time_flexibility_for_activity = share_in_total_flexibility * total_lag;
		return round_integer_to_pace_superior(time_flexibility_for_activity); //returns a hour_integer
	};
	get_related_opening_hours_integer_of_activity = function(activity, date_cursor){
		var opening_hours = activity.opening_hours;
		var hour_cursor = convert_date_to_hour_integer(date_cursor);
		var related_opening_hours_of_activity;
		for(i=0; i < opening_hours.length; i++){
			if(opening_hours[i].days.indexOf(date_cursor.getDay()) > -1){
				var opening_hours_in_day = opening_hours[i].open;
				for(j=0;j < opening_hours_in_day.length;j++){
					if(opening_hours_in_day[j].start < hour_cursor && opening_hours_in_day[j].close > hour_cursor)
						related_opening_hours_of_activity = {
							start: opening_hours_in_day[j].start,
							close: opening_hours_in_day[j].close	
						};
				}
			}
		}
		return related_opening_hours_of_activity; //returns an hour_integer
	};
});

Meteor.methods({

	algorithm: function(center,radius){

		var date_now = new Date();
		var date_cursor = round_date_to_pace_date(date_now,pace);
		var lat = center.lat;
		var lng = center.lng;
		var profile = "TestProfile";
		var requiresun = false;
		
		var min_rand = Activities.findOne({},{sort: {rand:1}}).rand;
		var random = Math.random();

		var types_excluded = [];
		var types_required = [];

		var track_results_id = [];
		var track_unwanted_id = [];

		var all_tests_passed = true;

		var total_time_amount = 0;
		var total_possible_time_flexibility_for_decrease = 0;
		var total_possible_time_flexibility_for_increase = 0;

		var results_of_activities = [];

		do {

			var hour = start.getHours();
			
			//FOR RESTAURANTS
			var types_considered = ['restaurant'];
			if (eatingHours.indexOf(hour) > -1)
				exclude_types(types_considered);
			else
				types_excluded.push(types_considered);

			var query = {
						_id: { $nin: track_results_id.concat(track_unwanted_id) },
						index : { $geoWithin: { $centerSphere : [ [ lng, lat ] , radius ] } },
						rand: { $gte: random },
						type: { $nin: types_excluded },
						profile: { $in: [profile] },
						opening_hours: { $elemMatch: { days: {$in: [time_cursor.getDay()]}, "open.start": {$gte: 1800}, "open.close": {$lte: 2300} } },
	
//						"last.value" : {$lte: remaining_time*4/3},
						//see for optional parameters: http://stackoverflow.com/questions/19579791/optional-parameters-for-mongodb-query
//						startdate: {$lte: time_cursor}, //startdate is not always defined...
//						enddate: {$gt: time_cursor}, //enddate is not always defined...
						requiresun: requiresun,
						
					};

			var activity = Activities.findOne({$query: query, $orderby: { rand: 1 } } );
			
			//Deal with activity defined or not
			if(typeof activity === "undefined"){
				if(random <= min_rand)
					break;
				else
					random = random * Math.random(); 
				continue;
			}
			else 
				random = Math.random();
			

			//If there are tests
			if(all_tests_passed){

				activity.start_date = date_cursor;
				
				var activity_last = activity.last.value;

				//Determine number of minutes after opening and before closing
				var related_opening_hours_of_activity = get_related_opening_hours_integer_of_activity(activity, date_cursor);
				var number_of_minutes_after_opening = convert_date_to_hour_integer(date_cursor) - related_opening_hours_of_activity.start;
				date_cursor = new Date(date_cursor.getTime() + unit*60000*activity_last); //We update the date_cursor with the new time stamp
				var number_of_minutes_before_closing = related_opening_hours_of_activity.close - convert_date_to_hour_integer(date_cursor);

				//Determine flexibility in both case: if we have to increase the length of activity, and if we have to decrease it
				var possible_time_flexibility_for_activity = activity_last * activity.last.flexibility;
				var possible_time_flexibility_for_decrease = Math.min(activity_last * activity.last.flexibility, number_of_minutes_after_opening);
				var possible_time_flexibility_for_increase = Math.min(activity_last * activity.last.flexibility, number_of_minutes_before_closing);

				//Setting these flexibility amount in "activity" object
				activity.possible_time_flexibility_for_decrease = Math.min(activity_last * activity.last.flexibility, number_of_minutes_after_opening);
				activity.possible_time_flexibility_for_increase = Math.min(activity_last * activity.last.flexibility, number_of_minutes_after_opening);
				
				//Determining total flexibility amount to test later
				total_time_amount += activity_last;
				total_possible_time_flexibility_for_decrease += possible_time_flexibility_for_decrease;
				total_possible_time_flexibility_for_increase += possible_time_flexibility_for_increase;

				
				results_of_activities.push(activity);
				track_results_id.push(activity._id);
				
			}
			else 
				track_unwanted_id.push(activity._id);
			
			results_of_activities_length = results_of_activities.length;
		}
		while (results_of_activities_length <= activities_length && total_time_amount < roulette_time_amount);
			
//		console.log(results);
		var total_lag = total_time_amount - roulette_time_amount;
		var is_flexible_enough = (total_lag > 0) ? (total_lag <= total_possible_time_flexibility_for_decrease) : (Math.abs(total_lag) <= total_possible_time_flexibility_for_increase);

		if(is_flexible_enough){

		}	
		return results;
	},
});

