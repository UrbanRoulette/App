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
	//hour_string
	convert_date_to_hour_string = function(date){
		var h = date.getHours();
		var m = date.getMinutes();
		var hh = (h>=10) ? '' : '0';
		var mm = (m>=10) ? '' : '0';
		var hour_string = hh + h.toString() + mm + m.toString();		
		return hour_string;
	};
	convert_hour_string_to_date = function(hour_string){
		var date = new Date();
		var h = parseInt(hour_string.substr(0,2));
		var m = parseInt(hour_string.substr(2,2));
		date_now.setHours(h,m,0,0);
		return date;
	};

	//hour_integer
	convert_date_to_hour_integer = function(date){
		return parseInt(convert_date_to_hour_string(date));
	};
	convert_hour_integer_to_date = function(hour_integer){
		var hour_string = hour_integer.toString();
		return convert_hour_string_to_date(hour_string);
	};

	//time
	add_time_amount_to_hour_integer = function(hour_integer,time_amount){
		//time_amount must be minutes
		var date = convert_hour_integer_to_date(hour_integer);
		date = new Date(date.getTime() + unit*60000*time_amount);
		return convert_date_to_hour_integer(date);	
	};
	
	//Related to LAST flexibility
	get_related_opening_hours_integer_of_activity = function(activity){
		var opening_hours = activity.opening_hours;
		var start_date = activity.start_date;
		var hour_cursor = convert_date_to_hour_integer(start_date);
		var related_opening_hours_of_activity;
		for(i=0; i < opening_hours.length; i++){
			if(opening_hours[i].days.indexOf(start_date.getDay()) > -1){
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
	update_last_and_date_of_subsequent_activities = function(index,time_change,total_time_lag){
		//int should be equal to -1 if we want to decrease time, and to +1 if we want to increase time		
		var sign = - total_time_lag / Math.abs(total_time_lag);

		results_of_activities[index].last += sign*time_change;

		for(i=index;i < results_of_activities.length; i++){
			if(sign === -1 && i > index) //If we want to decrease
				results_of_activities[i].start_date = new Date(results_of_activities[i].start_date.getTime() + sign*60000*time_change);
			else if (sign === 1)//If we want to increase
				results_of_activities[i].end_date = new Date(results_of_activities[i].end_date.getTime() + sign*60000*time_change);
		}
	};
	exclude_types = function(types_considered){	
		for(k=0; k < activity_types.length; k++){
			if(types_considered.indexOf(activity_types[k]) > -1)
				types_excluded.push(activity_types[k]);
		}
	};
});

Meteor.methods({

	get_activities_results: function(center,radius){

		var date_now = new Date();
		var date_cursor = round_date_to_pace_date(date_now,pace);
		var lat = center.lat;
		var lng = center.lng;
		var profile = "TestProfile";
		var requiresun = false;
		
		var min_rand = Activities.findOne({},{sort: {rand:1}}).rand;
		var random = Math.random();
		var minimum_last_value = 0;

		var types_excluded = [];
		var types_required = [];

		var track_results_id = [];
		var track_unwanted_id = [];

		var all_checks = false;
		var all_tests_passed = true;

		var total_time_amount = 0;
		var remaining_time = roulette_time_amount;

		var results_of_activities = [];

		do {

			//Loop selecting activities
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
							"last.value" : {$gt: minimum_last_value, $lte: remaining_time},
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
					date_cursor = new Date(date_cursor.getTime() + unit*60000*activity_last); //We update the date_cursor with the new time stamp
					activity.end_date = date_cursor;

					var activity_last_value = activity.last.value;
					remaining_time -= activity_last_value;
					total_time_amount += activity_last_value;

					results_of_activities.push(activity);
					track_results_id.push(activity._id);	
				}
				else 
					track_unwanted_id.push(activity._id);			
			}
			while (results_of_activities.length <= activities_length && total_time_amount < roulette_time_amount);
			
			//LOOP FOR FLEXIBILITY ON LAST => TO MAKE SURE THAT THE ROULETTE IS EQUAL TO roulette_time_amount
			var total_time_lag;
			var last_is_not_good = true;

			do {
		
				total_time_lag = total_time_amount - roulette_time_amount;
				var total_time_flexibility = roulette_time_amount;

				if(total_time_lag !== 0){

					minimum_last_value = roulette_time_amount;

					for(k = results_of_activities.length - 1; k >= 0; k--){

						var current_activity = results_of_activities[k];
						var current_activity_last_obj = current_activity.last;
						var possible_time_flexibility = current_activity_last_obj.time_flexibility;
						minimum_last_value = Math.min(minimum_last_value,current_activity_last_obj.value);

						var next_activity;
						var related_opening_hours_of_next_activity;

						if(k < results_of_activities.length - 1){
							next_activity = results_of_activities[k+1];
							related_opening_hours_of_next_activity = get_related_opening_hours_integer_of_activity(next_activity);
						}
						
						//time_change is the amount of time we're going to substract / add to the last of the current_activity			
						var time_change;

/*						if(total_time_lag > 0){ //Meaning that the roulette is more than roulette_time_amount

							var number_of_minutes_after_opening_next_activity;
							//
							time_change = Math.min(possible_time_flexibility,total_lag,total_time_flexibility);

							if(next_activity){
								number_of_minutes_after_opening_next_activity = (next_activity.start_date - convert_hour_integer_to_date(related_opening_hours_of_next_activity.start)) / 60000;
								possible_time_flexibility = Math.min(possible_time_flexibility, number_of_minutes_after_opening_next_activity);
								time_change = Math.min(time_change, possible_time_flexibility);
								total_time_flexibility = Math.min(total_time_flexibility - time_change, number_of_minutes_after_opening_next_activity - time_change);
							}
							total_time_lag -= time_change;						
						}
						else if (total_time_lag < 0){ //Meaning that the roulette is less than roulette_time_amount, but stopped because there are already activities_length activities
*/
							var number_of_minutes_before_closing_next_activity;
							
							//When increasing the amount of time of an activity, we have to make sure we don't go later than its closing hour
							related_opening_hours_of_current_activity = get_related_opening_hours_integer_of_activity(current_activity);
							var number_of_minutes_before_closing_current_activity = (convert_hour_integer_to_date(related_opening_hours_of_current_activity.close) - current_activity.end_date) / 60000;
							total_time_flexibility = number_of_minutes_before_closing_current_activity;

							//
							time_change = Math.min(possible_time_flexibility, Math.abs(total_lag),total_time_flexibility,number_of_minutes_before_closing_current_activity);

							if(next_activity){
								number_of_minutes_before_closing_next_activity = (convert_hour_integer_to_date(related_opening_hours_of_next_activity.close) - next_activity.end_date) / 60000;
								possible_time_flexibility = Math.min(possible_time_flexibility, number_of_minutes_before_closing_next_activity);
								time_change = Math.min(time_change,possible_time_flexibility);
								total_time_flexibility = Math.min(total_time_flexibility - time_change, number_of_minutes_before_closing_next_activity - time_change);	
							}					
							total_time_lag += time_change;	
//						}
						//To update subsequent activities' date
						update_last_and_date_of_subsequent_activities(k,time_change,total_time_lag);

						if(total_time_lag === 0){
							last_is_not_good = false;
							break;
						}
						if(total_time_flexibility === 0)
							break;			
					}
/*					if(total_time_lag > 0 && !check_last_of_roulette){
						total_time_amount -= results_of_activities[results_of_activities.length - 1].last.value;
						results_of_activities.pop();
					}
*/				}
				else
					last_is_not_good = false;
			}
			while(last_is_not_good /*|| total_time_lag > 0*/);

			all_checks = (last_is_not_good);
		}
		while(all_checks);	

		return results_of_activities;
	},
});

