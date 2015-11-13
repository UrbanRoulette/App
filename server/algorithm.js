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
	ms_in_min = 60000;

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
		var hour_string;
		if(hour_integer === 0)
			hour_string = "0000";
		else if(hour_integer < 100)
			hour_string = "00" + hour_integer.toString();
		else if(hour_integer < 1000)
			hour_string = "0" + hour_integer.toString();
		else
			hour_string = hour_integer.toString();
		return hour_string;
	};
	convert_date_to_hour_integer = function(date){
		return parseInt(convert_date_to_hour_string(date));
	};
	convert_hour_integer_to_date = function(hour_integer){
		var hour_string = convert_hour_integer_to_hour_string(hour_integer);
		return convert_hour_string_to_date(hour_string);
	};

	//time
	add_time_amount_to_hour_integer = function(hour_integer, time_amount){
		//time_amount must be minutes
		var date = convert_hour_integer_to_date(hour_integer);
		var previous_day = date.getDay();
		date = new Date(date.getTime() + ms_in_min*time_amount);	
		var day = date.getDay();
		var result;
		if(previous_day !== day && time_amount > 0)
			result = convert_date_to_hour_integer(date) + 2400;
		else if(previous_day !== day && time_amount < 0)
			result = convert_date_to_hour_integer(date) - 2400;
		else if (previous_day === day)
			result = convert_date_to_hour_integer(date);
		
		if(hour_integer - 2400 > result){
			result += 2400;
		}
		return result;	
	};

	//days
	convert_day_number_to_foursquare_day_number = function(day_nb){
		if(day_nb === 0)
			day_nb = 7;
		return day_nb;
	};
	
	//Related to LAST flexibility
	get_related_opening_hours_integer_of_activity = function(activity, day_number,start_cursor,end_cursor){

		var opening_hours = activity.opening_hours;
//		var start_date = activity.start_date;
//		var start_hour = convert_date_to_hour_integer(start_date);
		var related_opening_hours_integer_of_activity;

		for(i=0; i < opening_hours.length; i++){

			if(opening_hours[i].days.indexOf(day_number) > -1){

				var opening_hours_in_day = opening_hours[i].open;

				for(j=0;j < opening_hours_in_day.length;j++){

					if(opening_hours_in_day[j].start <= start_cursor && opening_hours_in_day[j].end_minus_last_min >= end_cursor){

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

	update_local_and_global_flex = function(results_of_activities){

		global_flex_time_up = 0;
		global_flex_time_down = 0;

		for(k=0; k < results_of_activities.length; k++){

			var a = results_of_activities[k];

			a.last.local_flex_time_up = Math.min(a.last.flex_time_up, a.last.time_before_end);
			a.last.local_flex_time_down = (k < results_of_activities.length - 1) ? Math.min(a.last.flex_time_down, results_of_activities[k+1].last.time_after_start) : a.last.flex_time_down;

			global_flex_time_up = Math.min(global_flex_time_up + a.last.flex_time_up, a.last.time_before_end);
			global_flex_time_down = (k === 0) ? a.last.flex_time_down : a.last.flex_time_down + Math.min(global_flex_time_down, a.last.time_after_start);

		}
	};
	update_times = function(){
		total_time_amount = 0;
		for(k=0; k < results_of_activities.length; k++)
			total_time_amount += results_of_activities[k].last.value;
		remaining_time = roulette_time_amount - total_time_amount;	
	};
	add_activity_to_results = function(activity){
		results_of_activities.push(activity);
		track_results_id.push(activity._id);
		update_local_and_global_flex(results_of_activities);
		update_times();
		types_excluded.push(activity.type);
		date_cursor = new Date(activity.end_date); //We update the date_cursor with the new time stamp
	};
	remove_last_activity_from_results = function(){
		results_of_activities.pop();
		track_results_id.pop();
		update_local_and_global_flex(results_of_activities);
		update_times();
		types_excluded.pop();
		date_cursor = (results_of_activities.length > 0) ? new Date(results_of_activities[results_of_activities.length - 1].end_date) : new Date(start_date_cursor);
	};
	require_type = function(type_considered){
		types_required = [];
		types_required.push(type_considered);
		var ind = types_excluded.indexOf(type_considered);
		if(ind > -1)
			types_excluded.splice(ind,1);
	};
	exclude_type = function(type_considered){
		if(types_excluded.indexOf(type_considered) === -1)
			types_excluded.push(type_considered);
		var ind = types_required.indexOf(type_considered);
		if(ind > -1)
			types_required.splice(ind,1);
	};
});

Meteor.methods({

	get_activities_results: function(center,radius){

		var date_now = new Date();
		date_now.setHours(21,30,0,0);
		
		date_cursor = round_date_to_pace_date(date_now,pace); //Must be defined globally
		start_date_cursor = new Date(date_cursor); //Must be defined globally
		var day = start_date_cursor.getDay();
		
		var lat = center.lat;
		var lng = center.lng;
		var profile = "Cheap";
		var requiresun = false;
		
		var min_rand = Activities.findOne({},{sort: {rand:1}}).rand;
		var random = Math.random();
		
		var previous_day = convert_day_number_to_foursquare_day_number(date_cursor.getDay());

		//These must be defined globally
		types_required = activity_types;
		types_excluded = [];

		track_results_id = []; //Must be defined globally
		var track_unwanted_id = {};
		for(j=0;j < activities_length;j++){
			track_unwanted_id[j] = [];
		}

		var all_checks = false;
		var all_tests_passed = true;
		var roulette_not_OK = true;

		total_time_amount = 0; //Must be defined globally
		remaining_time = roulette_time_amount - total_time_amount; //Must be defined globally

		var end_roulette_date = new Date(start_date_cursor.getTime() + roulette_time_amount*ms_in_min);
		var end_roulette_hour_integer = convert_date_to_hour_integer(end_roulette_date);
		var end_roulette_day = end_roulette_date.getDay();
		// !! end_points is an array !!
		var end_points = (end_roulette_day !== day) ? [end_roulette_hour_integer + 2400] : [end_roulette_hour_integer];
		console.log(end_points);

		results_of_activities = []; //Must be defined globally

		var best_results_so_far = { //Will be used in case roulette cannot be completed
			total_time_amount: 0, 
			results_of_activities: []
			}; 
		var results_length = results_of_activities.length;

		//These one have to be defined globally to be modified within a function
		global_flex_time_up = 0;
		global_flex_time_down = 0;

		var result_level = results_of_activities.length; //Is the level at which the algorithm is currently looking for an activity
		//If level = 0, it is looking for the 1st activity, if level = 1, for the 2nd, etc...

		var activity;

		do {			

			//Loop selecting activities
			do {

				if(result_level === activities_length){
					result_level -= 1;
					track_unwanted_id[result_level].push(results_of_activities[result_level]._id);
					remove_last_activity_from_results();
					
				}

				console.log("*********** NEW LOOP ***********");
				console.log("date_cursor : " + date_cursor);
				day = convert_day_number_to_foursquare_day_number(date_cursor.getDay());
				var hour = date_cursor.getHours();

				var hour_integer_cursor = convert_date_to_hour_integer(date_cursor);			
				hour_integer_cursor = (previous_day !== day) ? hour_integer_cursor + 2400 : hour_integer_cursor;

				console.log("hour_integer_cursor : " + hour_integer_cursor);
				
				var adjusted_start_hour_cursor = add_time_amount_to_hour_integer(hour_integer_cursor, global_flex_time_up);
				console.log("adjusted_start_hour_cursor : " + adjusted_start_hour_cursor);
				var adjusted_end_hour_cursor = add_time_amount_to_hour_integer(hour_integer_cursor, - global_flex_time_down);
				console.log("adjusted_end_hour_cursor : " + adjusted_end_hour_cursor);
				var adjusted_remaining_time = remaining_time + global_flex_time_down;
				console.log("adjusted_remaining_time : " + adjusted_remaining_time);

				//Not necessary but will avoid an activity too short to be picked if this is the last activity
//				var last_doc_query = {};
//				if(results_of_activities.length === activities_length - 1)
//					last_doc_query = {$where: function(){return ((End - this.opening_hours.end_minus_last_min) <= this.last.last_min)}};
				
				//Initialize required types
				types_required = activity_types;

				//FOR RESTAURANTS
				var type_considered = 'restaurant';
				var ind;
				if (eatingHours.indexOf(hour) > -1 && types_excluded.indexOf(type_considered) === -1)
					require_type(type_considered);
				else 
					exclude_type(type_considered);
				

				console.log(types_excluded);
				console.log(types_required);				
				console.log(result_level);

				var query = {
							_id: { $nin: track_unwanted_id[result_level].concat(track_results_id) },
							index : { $geoWithin: { $centerSphere : [ [ lng, lat ] , radius ] } },
							rand: { $gte: random },
							type: { $in: types_required, $nin: types_excluded },
							profile: { $in: [profile] },	
							opening_hours: { $elemMatch: { days: {$in: [day]}, open: {$elemMatch: {start: {$lte: adjusted_start_hour_cursor}, end_minus_last_min: {$gte: adjusted_end_hour_cursor} } } } },	
							"last.min": {$lte: adjusted_remaining_time},
							//see for optional parameters: http://stackoverflow.com/questions/19579791/optional-parameters-for-mongodb-query
	//						startdate: {$lte: date_cursor}, //startdate is not always defined...
	//						enddate: {$gt: date_cursor}, //enddate is not always defined...
	//						requiresun: requiresun,
						};

				activity = Activities.findOne({$query: query, $orderby: { rand: 1 } } );			
		
				//Deal with activity defined or not
				if(typeof activity === "undefined"){
					if(random <= min_rand){
						track_unwanted_id[result_level] = [];
						result_level -= 1;
						break;
					}
					else
						random = random * Math.random(); 
					continue;
				}
				else 
					random = Math.random();


				console.log("ACTIVTY NAME: " + activity.name);

				var related_opening_hours_integer_of_activity = get_related_opening_hours_integer_of_activity(activity, previous_day, adjusted_start_hour_cursor, adjusted_end_hour_cursor);
				console.log("related_opening_hours_integer_of_activity : " + JSON.stringify(related_opening_hours_integer_of_activity));
				
				var activity_open_hour = related_opening_hours_integer_of_activity.open;
				var activity_open_date = convert_hour_integer_to_date(activity_open_hour);
				var activity_close_hour = related_opening_hours_integer_of_activity.close;
				var activity_close_date = convert_hour_integer_to_date(activity_close_hour);

				var end_point = convert_hour_integer_to_date(end_points[0]);

				var beg_of_activity = new Date(Math.min(activity_open_date, end_point));
				var end_of_activity = new Date(Math.min(activity_close_date, end_point));
				console.log("end_of_activity : " + end_of_activity);

				//To determine beginning of activity
				var diff_beg = (beg_of_activity - date_cursor)/ms_in_min;
				console.log("diff_beg : " + diff_beg);
				var c = 0;
				var previous_act;
				var fill;
				var j;
				var act;

				if(diff_beg > 0){
					
					activity.start_date = new Date(date_cursor.getTime() + Math.max(0,diff_beg)*ms_in_min);
					console.log("start_date avec diff_beg: " + activity.start_date);
					
					while(diff_beg > 0){ //Need to flex up in this case (because activity opens after date_cursor)

						previous_act = results_of_activities[results_of_activities.length - 1 - c];
						fill = Math.min(diff_beg, previous_act.last.local_flex_time_up);
						console.log("Fill value diff_beg loop: " + fill);
						//Update end_date
						previous_act.end_date = new Date(previous_act.end_date.getTime() + fill*ms_in_min);
						
						//Update all fields related to flexibility
						previous_act.last.flex_time_up -= fill;
						previous_act.last.time_before_end -= fill; 

						previous_act.last.flex_time_down += fill;

						//Update subsequent activities
						if(c > 0){
							for(j=results_of_activities.length - c; j < results_of_activities.length; j++){
								act = results_of_activities[j];
								//
								act.last.time_after_start += fill;
								act.start_date = new Date(act.start_date.getTime() + fill*ms_in_min);
								//
								act.last.time_before_end -= fill;
								act.end_date = new Date(act.end_date.getTime() + fill*ms_in_min);			
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
					var diff_end = (end_of_activity - date_cursor)/ms_in_min - activity.last.min;
					console.log("diff_end : " + diff_end);

					activity.start_date = new Date(date_cursor.getTime() - Math.max(0, - diff_end)*ms_in_min);
					console.log("start_date avec diff_end: " + activity.start_date);

					while (diff_end < 0){ //Need to flex down in this case (because date_cursor + last.min finishes after close_hour => activity is too long)
						
						console.log('Counter value : ' + c);
						previous_act = results_of_activities[results_of_activities.length - 1 - c];
						fill = Math.min( - diff_end, previous_act.last.local_flex_time_down);
						console.log("Fill value diff_end loop: " + fill);

						if(fill === 0){
							c+= 1;
							continue;
						}
						
						//Update Update end_date
						previous_act.end_date = new Date(previous_act.end_date.getTime() - fill*ms_in_min);

						//Update all fields related to flexibility
						previous_act.last.flex_time_up += fill;
						previous_act.last.time_before_end += fill;

						previous_act.last.flex_time_down -= fill;

						//Update subsequent activities
						if(c > 0){

							for(j=results_of_activities.length - c; j < results_of_activities.length; j++){
								act = results_of_activities[j];
								//
								act.last.time_after_start -= fill;
								act.start_date = new Date(act.start_date.getTime() - fill*ms_in_min);
								//
								act.last.time_before_end += fill;
								act.end_date = new Date(act.end_date.getTime() - fill*ms_in_min);			
							}
						}
						//Update value of last of activity
						previous_act.last.value -= fill;

						//To make the while loop work
						diff_end += fill;
						c+= 1;							
					}
										
				}

				var time_before_end_of_activity = (end_of_activity - activity.start_date)/ms_in_min;
				activity.last.value = (time_before_end_of_activity > activity.last.value) ? Math.min(activity.last.max,time_before_end_of_activity) : time_before_end_of_activity;
				console.log(activity.last.value);
				
				activity.end_date = new Date(activity.start_date.getTime() + activity.last.value*ms_in_min);
				
				console.log("activity_end_date : " + activity.end_date);
				
				var activity_last_value = activity.last.value;
				previous_day = day;	

				//Define fields related to flexibility
				activity.last.time_before_end = (activity_close_date - activity.end_date)/ms_in_min;
				activity.last.time_after_start = (activity.start_date - activity_open_date)/ms_in_min;

				activity.last.flex_time_up = Math.min(activity.last.flex_time_up, activity.last.max - activity.last.value);
				activity.last.flex_time_down = Math.min(activity.last.flex_time_down,activity.last.value - activity.last.min);

				add_activity_to_results(activity);

				console.log("global_flex_time_up : " + global_flex_time_up);
				console.log("global_flex_time_down : " + global_flex_time_down);

				console.log("total_time_amount : " + total_time_amount);
				roulette_not_OK = (total_time_amount < roulette_time_amount);
				console.log("RESULTS LENGTH : " + results_of_activities.length);

				result_level = results_of_activities.length;

				if(total_time_amount > best_results_so_far.total_time_amount){
					best_results_so_far.total_time_amount = total_time_amount;
					best_results_so_far.results_of_activities = [];
					for(k=0;k<results_of_activities.length;k++)
						best_results_so_far.results_of_activities.push(results_of_activities[k]);
				}
			}
			while (roulette_not_OK);
			
			console.log("RESULT LEVEL : " + result_level);

			if(roulette_not_OK && result_level > -1){

				track_unwanted_id[result_level].push(results_of_activities[result_level]._id);
				remove_last_activity_from_results();

			}
			else {
				results_of_activities = best_results_so_far.results_of_activities;
				break;
			}
			
		}
		while(roulette_not_OK);	

		console.log("Results of activities : " + JSON.stringify(results_of_activities));
		console.log("Date cursor : " + date_cursor);
		console.log("Total time amount : " + total_time_amount);
		console.log("Results Length : " + results_of_activities.length);
		return results_of_activities;
	},
});

