Meteor.startup(function(){
	//Vocabulary
/*	Any variable with "date" is a Date Object
	Any variable with "hour" is looking like 1830 (hour_integer) or "1830" (hour_string)
	Any variable with "time" is an amount of time (usually minutes)
*/	
	//Parameters
	pace = 5; // Pace (in number of minutes) (must divide 60)
//	unit = 1; //Unit for the last of each activity in database (in number of minutes)
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
		if (quotient === 0)
			date.setHours(h,m,0,0); //Date does not change
		else if((quotient + 1) === 60/pace)
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
		var date = new Date(date_cursor);
		var h = parseInt(hour_string.substr(0,2));
		var m = parseInt(hour_string.substr(2,2));
		date.setHours(h,m,0,0);
		return date;
	};

	//hour_integer
	convert_hour_integer_to_hour_string = function(hour_integer){
		var hour_string = (hour_integer >= 1000) ? hour_integer.toString() : "0" + hour_integer.toString();
		return hour_string;
	};
	convert_date_to_hour_integer = function(date){
		return parseInt(convert_date_to_hour_string(date));
	};
	convert_hour_integer_to_date = function(hour_integer){
		var hour_string = (hour_integer > 1000) ? hour_integer.toString() : "0" + hour_integer.toString();
		return convert_hour_string_to_date(hour_string);
	};

	//time
	add_time_amount_to_hour_integer = function(hour_integer,time_amount){
		//time_amount must be minutes
		var date = convert_hour_integer_to_date(hour_integer);
		date = new Date(date.getTime() + 60000*time_amount);	
		var result = ((hour_integer + time_amount) >= 2400) ? convert_date_to_hour_integer(date) + 2400 : convert_date_to_hour_integer(date);
		return result;	
	};

	//days
	convert_day_number_to_foursquare_day_number = function(day_nb){
		if(day_nb === 0)
			day_nb = 7;
		return day_nb;
	};
	
	//Related to LAST flexibility
	get_related_opening_hours_integer_of_activity = function(activity){

		var opening_hours = activity.opening_hours;
		var start_date = activity.start_date;
		var start_hour = convert_date_to_hour_integer(start_date);
		var related_opening_hours_integer_of_activity;

		for(var i=0; i < opening_hours.length; i++){

			var day_number = convert_day_number_to_foursquare_day_number(start_date.getDay());

			if(opening_hours[i].days.indexOf(day_number) > -1){

				var opening_hours_in_day = opening_hours[i].open;

				for(j=0;j < opening_hours_in_day.length;j++){

					if(opening_hours_in_day[j].start < start_hour && opening_hours_in_day[j].end > start_hour){

						related_opening_hours_integer_of_activity = {
							open: opening_hours_in_day[j].start,
							close: opening_hours_in_day[j].end	
						};

						break;
					}
				}
				break;
			}
		}
		return related_opening_hours_integer_of_activity; //returns an hour_integer
	};
	update_last_and_date_of_subsequent_activities = function(index,time_change,total_time_lag,results_of_activities){
		//int should be equal to -1 if we want to decrease time, and to +1 if we want to increase time		
		var sign = - total_time_lag / Math.abs(total_time_lag);

		results_of_activities[index].final_last_value += sign*time_change;

		for(i=index;i < results_of_activities.length; i++){
			if(sign === -1 && i > index) //If we want to decrease
				results_of_activities[i].start_date = new Date(results_of_activities[i].start_date.getTime() + sign*60000*time_change);
			else if (sign === 1)//If we want to increase
				results_of_activities[i].end_date = new Date(results_of_activities[i].end_date.getTime() + sign*60000*time_change);
		}
	};
/*	force_types = function(array_types){	
		types_required = array_types;
	};
	exclude_types = function(types_required, array_types){	
		for(var k=0; k < array_types.length; k++){
			var index = types_required.indexOf(array_types[k]);
			if(index > -1)
				types_required.splice(index, 1);			
		}
	};
*/});

Meteor.methods({

	get_activities_results: function(center,radius){

		var date_now = new Date();
		date_now.setHours(12,0,0,0);
		var date_cursor = round_date_to_pace_date(date_now,pace);
		var lat = center.lat;
		var lng = center.lng;
		var profile = "TestProfile";
		var requiresun = false;
		
		var min_rand = Activities.findOne({},{sort: {rand:1}}).rand;
		console.log(min_rand);
		var random = Math.random();
		
		var previous_day = convert_day_number_to_foursquare_day_number(date_cursor.getDay());

		var types_required = activity_types;
//		console.log(types_required);

		var track_results_id = [];
		var track_unwanted_id = [];

		var all_checks = false;
		var all_tests_passed = true;
		var roulette_not_OK = true;

		var total_time_amount = 0;
		var remaining_time = roulette_time_amount;
		var minimum_last_value = 0;

		var results_of_activities = [];
		var results_length = results_of_activities.length;

		var global_flex_time_up = 0;
		var global_flex_time_down = 0;

		do {			

			if(typeof index_to_split_results_of_activities !== "undefined"){
				var ind = index_to_split_results_of_activities;
				results_of_activities.splice(ind,results_length - ind);
			}
			//Loop selecting activities
			do {

				console.log("IS IN NEW LOOP");
				var day = convert_day_number_to_foursquare_day_number(date_cursor.getDay());
				var hour = date_cursor.getHours();
				var hour_integer_cursor = convert_date_to_hour_integer(date_cursor);
				console.log(hour_integer_cursor);
				hour_integer_cursor = (previous_day !== day) ? hour_integer_cursor + 2400 : hour_integer_cursor;
				
				var adjusted_start_hour_cursor = add_time_amount_to_hour_integer(hour_integer_cursor, global_flex_time_up);
				var adjusted_end_hour_cursor = add_time_amount_to_hour_integer(hour_integer_cursor, - global_flex_time_down);
				var adjusted_remaining_time = remaining_time + global_flex_time_down;
/*				//FOR RESTAURANTS
				var types_considered = ['restaurant'];
				if (eatingHours.indexOf(hour) > -1)
					force_types(types_considered);
				else
					exclude_types(types_required, types_considered);
*/
				var query = {
	//						_id: { $nin: track_unwanted_id },
							index : { $geoWithin: { $centerSphere : [ [ lng, lat ] , radius ] } },
							rand: { $gte: random },
	//						type: { $in: types_required },
	//						profile: { $in: [profile] },	
							opening_hours: { $elemMatch: { days: {$in: [day]}, open: {$elemMatch: {start: {$lte: adjusted_start_hour_cursor}, end_minus_last: {$gte: adjusted_end_hour_cursor} } } } },	
							"last.min": {$lte: adjusted_remaining_time},
							//see for optional parameters: http://stackoverflow.com/questions/19579791/optional-parameters-for-mongodb-query
	//						startdate: {$lte: date_cursor}, //startdate is not always defined...
	//						enddate: {$gt: date_cursor}, //enddate is not always defined...
	//						requiresun: requiresun,
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
					track_unwanted_id.push(activity._id);

				random = Math.random();
				

				//If there are tests
				if(all_tests_passed){

					var related_opening_hours_integer_of_activity = get_related_opening_hours_integer_of_activity(activity);
					var activity_open_hour = related_opening_hours_integer_of_activity.open;
					var activity_open_date = convert_hour_integer_to_date(activity_open_hour);
					var activity_close_hour = related_opening_hours_integer_of_activity.close;
					var activity_close_date = convert_hour_integer_to_date(activity_close_hour);
					
					//To determine beginning of activity
					var diff_beg = (activity_open_date - date_cursor)/60000;
					var c = 0;
					var previous_act;
					var fill;
					var j;
					var act;

					if(diff_beg > 0){

						activity.start_date = new Date(date_cursor.getTime() + Math.max(0,diff_beg));
						
						while(diff_beg > 0){
							previous_act = results_of_activities[results_length - 1 - c];
							fill = Math.min(diff_beg,previous_act.last.local_flex_time_up);
							//Update all fields related to flex_up
							previous_act.last.flex_time_up -= fill;
							previous_act.last.time_before_end -= fill; 
							previous_act.last.local_flex_time_up = Math.min(previous_act.last.flex_time_up, previous_act.last.time_before_end);
							//Update all fields related to flex_down
							previous_act.last.flex_time_down += fill;
							previous_act.last.local_flex_time_down = previous_act.last.flex_time_down;
							if(c > 0){
								for(j=results_length - c; j < results_length; j++){
									act = results_of_activities[j];
									act.last.time_after_start += fill;
									if(j === results_length - c)
										previous_act.last.local_flex_time_down = Math.min(previous_act.last.flex_time_down, act.last.time_after_start);					
								}
							}
							//Update last value of activity
							previous_act.last.value += fill;
							//To make the while loop work
							diff_beg -= fill;
							c+= 1;
						}
						//In this case, activity last cannot be lower than activity.last.value, so no need to do anything on last
						
					}
					else {

						//To determine beginning and end of activity
						var diff_end = (activity_end_date - date_cursor)/60000 - activity.last.min;
						activity.start_date = new Date(date_cursor.getTime() - Math.max(0, - diff_end));

						while (diff_end < 0){
							previous_act = results_of_activities[results_length - 1 - c];
							fill = Math.min(diff_end,previous_act.last.local_flex_time_down);
							//Update all fields related to flex_up
							previous_act.last.flex_time_up += fill;
							previous_act.last.time_before_end += fill;
							previous_act.last.local_flex_time_up = Math.min(previous_act.last.flex_time_up, previous_act.last.time_before_end);
							//Update all fields related to flex_down
							previous_act.last.flex_time_down -= fill;
							previous_act.last.local_flex_time_down = previous_act.last.flex_time_down;
							if(c > 0){
								for(j=results_length - c; j < results_length; j++){
									act = results_of_activities[j];
									act.last.time_after_start -= fill;
									if(j === results_length - c)
										previous_act.last.local_flex_time_down = Math.min(previous_act.last.flex_time_down, act.last.time_after_start);					
								}
							}
							//Update last value of activity
							previous_act.last.value -= fill;
							//To make the while loop work
							diff_end -= fill;
							c+= 1;							
						}
						activity.last.value = Math.min(activity.last.value,(activity_close_hour - activity.start_date)/60000);						
					}
					activity.end_date = new Date(activity.start_date.getTime() + activity.last.value*60000);
					var activity_end_date = activity.end_date;
					
					//Define local flexibilities of new activity
					//Define all fields related to flex_up
					var time_before_end = (activity_close_date - activity_end_date)/60000;
					activity.last.time_before_end = time_before_end;
					activity.last.local_flex_time_up = Math.min(activity.last.flex_time_up, time_before_end);
					
					//Define all fields related to flex_down
					activity.last.local_flex_time_down = activity.last.flex_time_down;
					var time_after_start = (activity.start_date - activity_open_date)/60000;
					activity.last.time_after_start = time_after_start;
					//Updqte local_flex_down of last activity
					previous_act = results_of_activities[results_length - 1];
					previous_act.last.local_flex_time_down = Math.min(previous_act.last.local_flex_time_down,time_after_start);
					
					var activity_last_value = activity.last.value;
					previous_day = day;	
					date_cursor = new Date(activity_end_date); //We update the date_cursor with the new time stamp

					remaining_time -= activity_last_value;
					total_time_amount += activity_last_value;

					results_of_activities.push(activity);
					track_results_id.push(activity._id);	
				}

				//Update global_flexibility
				results_length = results_of_activities.length;
				for(var k=0;k<results_length;k++){
					
				}

//				track_unwanted_id.push(activity._id);
				roulette_not_OK = (total_time_amount < roulette_time_amount);		
			}
			while (roulette_not_OK);
			
			
		}
		while(roulette_not_OK);	

		console.log("Results of acitvities : " + results_of_activities);
		return results_of_activities;
	},
});

