	Meteor.startup(function(){
	//Vocabulary
/*	Any variable with "date" is a Date Object
	Any variable with "hour" is looking like 1830 (hour_integer) or "1830" (hour_string)
	Any variable with "time" is an amount of time (usually minutes)
*/
	//Parameters
	pace = 5; // Pace (in number of minutes) (must divide 60)
	ms_in_min = 60000; //Number of milliseconds in a minute
	min_rand = Activities.findOne({},{sort: {rand:1}}).rand; //

	//Functions used in algorithm
	round_date_to_pace_date = function(date, pace){
		var h = date.getHours();
		var m = date.getMinutes();
		var result = m/pace;
		var quotient = Math.floor(result);
		//Important to set seconds and milliseconds to 0!
		if((quotient + 1) === 60/pace) date.setHours(h+1,0,0,0); //If minutes was between 56 and 59
		else if(quotient === result) date.setHours(h,m,0,0); //If minutes was a multiple of pace (i.e. if pace =5, then minutes is 15,20,25,...)
		else date.setHours(h,(quotient+1)*pace,0,0); //Other cases
		return date;
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
		if(hour_integer === 0) hour_string = "0000";
		else if(hour_integer < 100) hour_string = "00" + hour_integer.toString();
		else if(hour_integer < 1000) hour_string = "0" + hour_integer.toString();
		else hour_string = hour_integer.toString();
		return hour_string;
	};
	convert_date_to_hour_integer = function(date){
		var h = date.getHours();
		var m = date.getMinutes();
		var hh = (h>=10) ? '' : '0';
		var mm = (m>=10) ? '' : '0';
		var hour_string = hh + h.toString() + mm + m.toString();
		return parseInt(hour_string);
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
		//
		var result;
		if(previous_day !== day && time_amount > 0) result = convert_date_to_hour_integer(date) + 2400;
		else if(previous_day !== day && time_amount < 0) result = convert_date_to_hour_integer(date) - 2400;
		else if (previous_day === day) result = convert_date_to_hour_integer(date);
		if(hour_integer - 2400 > result) result += 2400;

		return result;
	};

	//days
	convert_day_number_to_foursquare_day_number = function(day_nb){
		if(day_nb === 0) day_nb = 7;
		return day_nb;
	};

	//Related to LAST flexibility
	get_related_opening_hours_integer_of_activity = function(activity,day_number,start_cursor,end_cursor){

		var hours_array = activity.opening_hours;
		var related_opening_hours_integer_of_activity;

		for(k=0;k<hours_array.length;k++){

			var dates = hours_array[k].dates;

			if(typeof dates.beg === "undefined" && typeof dates.end === "undefined"){}
			else {
				if(dates.beg.getTime() <= date_cursor.getTime() && dates.end.getTime() >= date_cursor.getTime()){}
				else continue;
			}

			var opening_hours = hours_array[k].week;

			for(i=0; i < opening_hours.length; i++){

				if(opening_hours[i].days.indexOf(day_number) > -1){

					var opening_hours_in_day = opening_hours[i].hours;

					for(j=0;j < opening_hours_in_day.length;j++){

						if(opening_hours_in_day[j].open <= start_cursor && opening_hours_in_day[j].close_minus_last_min >= end_cursor){

							related_opening_hours_integer_of_activity = {
								open: opening_hours_in_day[j].open,
								close: opening_hours_in_day[j].close
							};

							break;
						}
					}
					break;
				}
			}
		}
		return related_opening_hours_integer_of_activity; //returns hour_integers
	};
	update_local_and_global_flex = function(results){

		global_flex_time_up = 0;
		global_flex_time_down = 0;

		for(k=0; k < results.length; k++){

			var a = results[k];

			a.last.local_flex_time_up = Math.min(a.last.flex_time_up, a.last.time_before_close);
			a.last.local_flex_time_down = (k < results.length - 1) ? Math.min(a.last.flex_time_down, results[k+1].last.time_after_open) : a.last.flex_time_down;

			global_flex_time_up = Math.min(global_flex_time_up + a.last.flex_time_up, a.last.time_before_close);
			global_flex_time_down = (k === 0) ? a.last.flex_time_down : a.last.flex_time_down + Math.min(global_flex_time_down, a.last.time_after_open);

		}
	};
	update_activity_time_flexibilities = function(previous_act,fill,sign){
		//Update end_date
		previous_act.end_date = new Date(previous_act.end_date.getTime() + sign*fill*ms_in_min);
		//Update fields related to flexibility
		previous_act.last.flex_time_up -= sign*fill;
		previous_act.last.flex_time_down += sign*fill;
		//Update last value
		previous_act.last.value += sign*fill;
		//Update time before end
		previous_act.last.time_before_close -= sign*fill;
	};
	update_subsequent_activities_dates = function(c,fill,sign){
		for(j=results.length - c; j < results.length; j++){
			var act = results[j];
			//
			act.last.time_after_open += sign*fill;
			act.start_date = new Date(act.start_date.getTime() + sign*fill*ms_in_min);
			//
			act.last.time_before_close -= sign*fill;
			act.end_date = new Date(act.end_date.getTime() + sign*fill*ms_in_min);
		}
	};
	update_total_time_amount = function(){
		total_time_amount = 0;
		for(k=0;k<results.length;k++) total_time_amount += results[k].last.value;
	};
	add_activity_to_results = function(activity){
		results.push(activity);
		if(activity.locked) lock_index += 1;
		result_level += 1;
		track_results_id.push(activity._id);
		update_local_and_global_flex(results);
		update_total_time_amount();
		if(!activity.locked) types_excluded.push(activity.classification.type); //We already excluded the type of locked activities at the beginning of the algorithm
		date_cursor = new Date(activity.end_date); //We update the date_cursor with the new time stamp
	};
	remove_last_activity_from_results = function(){
		var last_activity = results[results.length - 1];
		if(last_activity.locked) lock_index -= 1;
		result_level -= 1;
		track_unwanted_id[result_level].push(results[result_level]._id);
		results.pop();
		track_results_id.pop();
		update_local_and_global_flex(results);
		update_total_time_amount();
		types_excluded.splice(types_excluded.indexOf(last_activity.classification.type),1);
		date_cursor = new Date(date_cursor.getTime() - last_activity.last.value*ms_in_min);
	};
	require_type = function(type){
		types_required = [];
		types_required.push(type);
		var ind = types_excluded.indexOf(type);
		if(ind > -1) types_excluded.splice(ind,1);
	};
	exclude_type = function(type){
		if(types_excluded.indexOf(type) === -1) types_excluded.push(type);
		var ind = types_required.indexOf(type);
		if(ind > -1) types_required.splice(ind,1);
	};
	get_weather_query = function(weather){
		var weather_query;
		if(weather === "clear") weather_query = {"requirements.sun": true};
		else if (weather === "clouds") weather_query = {"requirements.sun": {$in: [true,false]}};
		else if (weather === "rain") weather_query = {"requirements.sun": false};
		return weather_query;
	};
	get_activity = function(type_of_search,max_radius,profile,weather){
		var activity;
		var weather_query = get_weather_query(weather);

		//If type of search === "get_result"
		var time_before_next_end_point;
		var end_point_hour_integer;
		var last_max_query;
		var last_doc_query;

		//If type of search === "switch_result"
		var last;
		var initial_coord;
		var previous_coord;
		var next_coord;

		if(type_of_search === "get_result"){
			day = convert_day_number_to_foursquare_day_number(date_cursor.getDay());
			end_point_hour_integer = (end_point.getHours() < date_cursor.getHours()) ? convert_date_to_hour_integer(end_point) + 2400 : convert_date_to_hour_integer(end_point);
			time_before_next_end_point = (end_point.getTime() - date_cursor.getTime())/ms_in_min;

			//If this is the last doc, make sure we pick an activity that is long enough and 
			last_max_query = (max_nb_of_activities_for_this_slot === 1) ? {"last.max": {$gte: time_before_next_end_point}} : {};
			last_doc_query = (max_nb_of_activities_for_this_slot === 1) ? {close: {$gte: end_point_hour_integer}} : {};
			//To know localization of latest_activity
			coord = results.length > 0 ? results[results.length - 1].index.coordinates : coord;
		}
		else if(type_of_search === "switch_result"){

			day = convert_day_number_to_foursquare_day_number(start_date.getDay());
			last = activity_to_switch.last.value;

			initial_coord = activity_to_switch.initial_coord;
			previous_coord = activity_to_switch.previous_coord;
			next_coord = activity_to_switch.next_coord;
			if(typeof previous_coord === "undefined" && typeof next_coord === "undefined"){ //In case there is only one activity in the results
				previous_coord = initial_coord;
				next_coord = initial_coord;
			}
			else if(typeof previous_coord === "undefined") previous_coord = next_coord; //In case activity was the first one
			else if(typeof next_coord === "undefined") next_coord = previous_coord; //In case activity was the last one
		}

		//Weather:
		do {
			var radius_activity = 2;
			radius_initial = 3;
			//Radius:
			do {

				var random = Math.random();
				//Random:
				do {
					var query;
					if(type_of_search === "get_result"){

						query = {
									$and:
										[
											{
												_id: { $nin: track_unwanted_id[result_level].concat(track_results_id) },
												$and: [
													{index : { $geoWithin: { $centerSphere : [ [ lng, lat ] , radius_initial/3963.2 ] } } }, //Designated location
													{index : { $geoWithin: { $centerSphere : [ [ coord[0], coord[1] ] , radius_activity/3963.2 ] } } } //Previous activity point
												],
												rand: { $gte: random },
												"classification.class": "Activity",
												"classification.type": { $in: types_required, $nin: types_excluded },
												tags: { $in: profile },
												opening_hours: { $elemMatch: { 	"$or": [
																						{"dates.beg": {$lte: date_cursor}, "dates.end": {$gte: date_cursor} },
																						{"dates.beg": {$exists: false}, "dates.end": {$exists: false} }
																				],
																				"week": {$elemMatch: {
																					days: day,
																					hours: {$elemMatch: {
																						$and: [
																							{open: {$lte: adjusted_start_hour_cursor} }, //Make sure activity is open
																							{open_plus_last_min: {$lte: end_point_hour_integer} }, //Make sure activity is not starting too late
																							{close_minus_last_min: {$gte: adjusted_end_hour_cursor} }, //Make sure activity won't close too early (ie it will still be open if we had last.min do date_cursor)
																							last_doc_query
																						]
																						} }
																					} }

																				}
																			 },
											"last.min": {$lte: time_before_next_end_point + global_flex_time_down}, //Avoid too long activities
											},
	//											weather_query,
											last_max_query
										]
									};
						}

					else if (type_of_search === "switch_result"){

						query = {
									$and:
										[
											{
												_id: { $nin: activities_switched_ids },
												$and: [
												{index : { $geoWithin: { $centerSphere : [ [ initial_coord[0], initial_coord[1] ] , radius_initial/3963.2 ] } } }, //Designated location
												{index : { $geoWithin: { $centerSphere : [ [ previous_coord[0], previous_coord[1] ] , radius_activity/3963.2 ] } } }, //Previous activity point
												{index : { $geoWithin: { $centerSphere : [ [ next_coord[0], next_coord[1] ] , radius_activity/3963.2 ] } } } //Next activity point
												],
												rand: { $gte: random },
												"classification.class": "Activity",
												"classification.type": activity_to_switch.classification.type,
			//									tags: { $in: profile },
												opening_hours: { $elemMatch: { 	"$or": [
																						{"dates.beg": {$lte: start_date}, "dates.end": {$gte: end_date} },
																						{"dates.beg": {$exists: false}, "dates.end": {$exists: false} }
																				],
																				"week": {$elemMatch: {
																					days: day,
																					hours: {$elemMatch: {
																						$and: [
																							{open: {$lte: convert_date_to_hour_integer(start_date)} }, //Make sure activity is open
																							{close: {$gte: convert_date_to_hour_integer(end_date)} }, //Make sure activity won't close too early
																						]
																						} }
																					} }

																				}
																			 },
											"last.min": {$lte: last}, //Make sure activity is not too long
											"last.max": {$gte: last} //Make sure activity is not too short
											}
			//								weather_query
										]
									};	
					}

					activity = Activities.findOne({$query: query, $orderby: { rand: 1 } } );
					//Change random or break loop if it was already as low as possible
					if(random > min_rand) random = random * Math.random();
					else break;
				}
				while(typeof activity === "undefined");

				//Increase radius or break loop if already too large
				if(radius_activity < max_radius && radius_activity <= radius_initial)
					radius_activity = radius_initial*2; 
				else if (radius_initial <= max_radius)
					radius_initial += 1;
				else break;
			}
			while(typeof activity === "undefined");

			//Change weather query or break loop if it was already as large as possible
			if(weather === "clouds") weather_query = {"requirements.sun": {$in: [true,false]}};
			else break;
		}
		while(typeof activity === "undefined");	

		return activity;
	};
	
});

Meteor.methods({

	get_activities_results: function(center,max_radius,date,timezoneOffset,profile,weather,activities_locked){

		console.log("Weather : " + weather);
		
		//INITIALIZATION
//		var activities_locked = [];
		lat = center.lat; //Must be defined globally
		lng = center.lng; //Must be defined globally
		coord = [lng,lat]; //Must be defined globally
//		var profile = ["gratuit", "cheap", "exterieur", "curieux", "couple", "solo", "potes", "prestige"];

		console.log("weather : " + weather);
		var roulette_time_amount = 6*60;//6*60; //Length of day (in number of unit). Ex: If unit=30 (ie half-hour), then dayLength = 2 means 1 hour
		var max_activities_nb = roulette_time_amount/90; //Max number of activities in the draw
		max_radius = 10; //Maximum radius, in miles

		//DATE CURSOR
		console.log("date before timeZoneOffset : " + date);
		date = new Date(date.getTime() - timezoneOffset*ms_in_min);
		console.log("date after timeZoneOffset : " + date);
		date.setHours(12,29,0,0);
		date_cursor = round_date_to_pace_date(date,pace); //Must be defined globally
		console.log("rounded date_cursor : " + date_cursor);
		var date_cursor_start = new Date(date_cursor);
		var date_cursor_end = new Date(date_cursor.getTime() + roulette_time_amount*ms_in_min);
		day = convert_day_number_to_foursquare_day_number(date_cursor.getDay()); //Must be defined globally
		previous_day = day; //Must be defined globally 

		//TRACKING
		//RESULTS TRACKING
		track_results_id = []; //Must be defined globally
		track_unwanted_id = {}; //Must be defined globally
		for(j=0;j < max_activities_nb;j++) track_unwanted_id[j] = [];
		//TIME TRACKING
		total_time_amount = 0; //Must be defined globally
		global_flex_time_up = 0; //Must be defined globally
		global_flex_time_down = 0; //Must be defined globally

		//TYPES
		var type_considered;
		types_required = activity_types; //Must be defined globally
		types_excluded = []; //Must be defined globally

		//LOCKED ACTIVITIES
		var end_points = [];
		nb_slots_to_fill = 1; //Must be defined globally
		lock_index = 0; //Must be defined globally -- will enable to track the index of the locked activity that has not been added to results yet
		var new_passage = [];
		var test_cursor = new Date(date_cursor_start);

		if(activities_locked.length > 0){

			activities_locked = activities_locked.sort(function(a,b){return ((a.start_date).getTime() - (b.start_date).getTime());});

			var first_locked = activities_locked[0];
			var diff_time = date_cursor.getTime() - first_locked.start_date.getTime();
			//Code below deals with one edge case: If user gets a roulette starting a 13h30 for instance, lock activities and relaunch a roulette which starts at 13h35 because some time passed inbetween
			if(diff_time > 0){
				//Modifies start_date
				first_locked.start_date = new Date(date_cursor);
				//Check if necessary to modify the last end_date, and modifies it if it is
				var last_locked = activities_locked[activities_locked.length - 1];
				var theoretical_end = new Date(last_locked.end_date.getTime() + diff_time);
				if(theoretical_end.getTime() === date_cursor_end.getTime()) last_locked.end_date = new Date(date_cursor_end);
			}

			nb_slots_to_fill = 0;
			for (k=0;k<activities_locked.length;k++){

				var act_locked = activities_locked[k];
				act_locked.locked = true;
				exclude_type(act_locked.classification.type);

				if(test_cursor.getTime() !== act_locked.start_date.getTime()) nb_slots_to_fill += 1;
				test_cursor = new Date(act_locked.end_date);
				new_passage.push(true);
				end_points.push(act_locked.start_date);
			}
			if(test_cursor < date_cursor_end) nb_slots_to_fill += 1;
		}
		end_points.push(date_cursor_end);
		console.log(end_points);
		var slot_index = (end_points[0].getTime() === date_cursor.getTime()) ? -1 : 0;

		//RESULTS
		var activity;
		results = []; //Must be defined globally
		var best_results_so_far = { total_time_amount: 0, results: []}; //Will be used in case roulette cannot be completed
		result_level = 0; //Must be defined globally //Is the level at which the algorithm is currently looking for an activity: If level = 0, it is looking for the 1st activity, if level = 1, for the 2nd, etc...
		var roulette_not_OK = true;

		//BEGINNING OF ALGORITHM
		Algorithm:
		do {

			console.log("*********** NEW LOOP ***********");
			console.log("date_cursor : " + date_cursor);

			console.log("RESULT LEVEL just avant locked activities: " + result_level);

			//FOR LOCKED ACTIVITIES
			var change_of_slot = 0;
			while(activities_locked.length - 1 >= lock_index){

				console.log('lock_index : ' + lock_index);
				console.log(new_passage);

				var activity_locked = activities_locked[lock_index];

				if(activity_locked.start_date.getTime() === date_cursor.getTime()){

					console.log('new_passage[lock_index] : ' + new_passage[lock_index]);
					if(new_passage[lock_index]){
						console.log('activity locked added');
						new_passage[lock_index] = false;
						add_activity_to_results(activity_locked);
						change_of_slot = 1;
					}
					else { //Enables to go up one level in the result to look for different activities
						console.log('activity locked removed');
						new_passage[lock_index] = true;
						if(results.length === 0){results = best_results_so_far.results; break Algorithm;}
						else remove_last_activity_from_results();
						change_of_slot = -1;
					}
				}
				else
					break;
			}
			if(date_cursor.getTime() === date_cursor_end.getTime()) break Algorithm;

			slot_index += change_of_slot;
			//Must be defined globally
			max_nb_of_activities_for_this_slot = (max_activities_nb - results.length - (activities_locked.length - lock_index)) - (nb_slots_to_fill - slot_index) + 1;

			console.log('max_nb_of_activities_for_this_slot : ' + max_nb_of_activities_for_this_slot);
			console.log('slot_index : ' + slot_index);
			console.log("date_cursor : " + date_cursor);
			console.log("RESULT LEVEL : " + result_level);
			console.log('lock_index : ' + lock_index);

			//
			// day = convert_day_number_to_foursquare_day_number(date_cursor.getDay());
			// var end_point = end_points[lock_index];
			end_point = end_points[lock_index]; //Must be defined globally
			// var end_point_hour_integer = (end_point.getHours() < date_cursor.getHours()) ? convert_date_to_hour_integer(end_point) + 2400 : convert_date_to_hour_integer(end_point);
			// var time_before_next_end_point = (end_point.getTime() - date_cursor.getTime())/ms_in_min;

			// console.log(end_point_hour_integer);
			var hour_integer_cursor = (previous_day !== day) ? convert_date_to_hour_integer(date_cursor) + 2400 : convert_date_to_hour_integer(date_cursor);
			adjusted_start_hour_cursor = add_time_amount_to_hour_integer(hour_integer_cursor, global_flex_time_up); //Must be defined globally
			adjusted_end_hour_cursor = add_time_amount_to_hour_integer(hour_integer_cursor, - global_flex_time_down); //Must be defined globally

			// //If this is the last doc, make sure we pick an activity that is long enough and 
			// var last_max_query = (max_nb_of_activities_for_this_slot === 1) ? {"last.max": {$gte: time_before_next_end_point}} : {};
			// var last_doc_query = (max_nb_of_activities_for_this_slot === 1) ? {close: {$gte: end_point_hour_integer}} : {};
			// //To know localization of latest_activity
			// coord = results.length > 0 ? results[results.length - 1].index.coordinates : coord;

			//FOR TYPES
			//Initialize required types with all existing types
			types_required = activity_types;
			//Restaurant
			type_considered = 'restaurant';
			var hour = date_cursor.getHours();
			if (eatingHours.indexOf(hour) > -1 && (profile.indexOf('gratuit') === -1 || profile.length > 1) && types_excluded.indexOf(type_considered) === -1) require_type(type_considered);
			else exclude_type(type_considered);
			//Sport
			type_considered = "sport";
			if(results.length > 0) exclude_type(type_considered);

			console.log(types_excluded);
			console.log(types_required);
			console.log("RESULT LEVEL just avant QUERY: " + result_level);
			console.log('track_unwanted_id[result_level] : '); console.log(track_unwanted_id[result_level]);

			activity = get_activity("get_result",max_radius,profile,weather);
			//If we could not find an activity
			if(typeof activity === "undefined") {
				//Delete previous activity selected
				if(result_level > 0){
					track_unwanted_id[result_level] = [];
					remove_last_activity_from_results(); 
					continue Algorithm;
				}
				else { 
					results = best_results_so_far.results; 
					console.log("radius_initial : " + radius_initial);
					break Algorithm;
				}	
			}

			console.log("ACTIVITY NAME: " + activity.main.name);

			//Determine open and close date of activity
			var related_opening_hours_integer_of_activity = get_related_opening_hours_integer_of_activity(activity, previous_day, adjusted_start_hour_cursor, adjusted_end_hour_cursor);
			console.log("related_opening_hours_integer_of_activity : " + JSON.stringify(related_opening_hours_integer_of_activity));
			var activity_open_date = convert_hour_integer_to_date(related_opening_hours_integer_of_activity.open);
			var activity_close_date = new Date(Math.min(convert_hour_integer_to_date(related_opening_hours_integer_of_activity.close), end_point));
			console.log('activity_open_date : ' + activity_open_date);
			console.log('activity_close_date : ' + activity_close_date);

			//Determine start_date of activity
			var diff_beg = (activity_open_date - date_cursor)/ms_in_min;
			var diff_end = (activity_close_date - date_cursor)/ms_in_min - activity.last.min;
			console.log("diff_beg : " + diff_beg);
			console.log("diff_end : " + diff_end);
			if(diff_beg > 0) activity.start_date = new Date(date_cursor.getTime() + Math.max(0,diff_beg)*ms_in_min);
			else activity.start_date = new Date(date_cursor.getTime() - Math.max(0, - diff_end)*ms_in_min);

			//Detemine last and end_date of activity
			console.log('activity.start_date' + activity.start_date);
			var time_before_activity_close = (activity_close_date - activity.start_date)/ms_in_min;
			console.log('time_before_activity_close : ' + time_before_activity_close);
			time_before_next_end_point = (end_point.getTime() - activity.start_date.getTime())/ms_in_min;
			console.log('time_before_next_end_point : ' + time_before_next_end_point);
			console.log('total_time_amount : ' + total_time_amount);
			var total_last_slices = (activity.last.max - activity.last.min)/pace;
//			var last_slices = (max_nb_of_activities_for_this_slot === 1) ? total_last_slices : Math.floor(Math.random() * (total_last_slices + 1));
			var last_slices = total_last_slices;
			activity.last.value = Math.min(Math.min(activity.last.min + last_slices*pace, time_before_activity_close), time_before_next_end_point);
			activity.end_date = new Date(activity.start_date.getTime() + activity.last.value*ms_in_min);
			console.log("activity_end_date : " + activity.end_date);

			//Temporary fix
			activity.start_hour = activity.start_date.getHours();
			activity.start_minutes = activity.start_date.getMinutes();
			activity.end_hour = activity.end_date.getHours();
			activity.end_minutes = activity.end_date.getMinutes();
			//Define fields related to flexibility
			activity.last.time_before_close = (activity_close_date - activity.end_date)/ms_in_min;
			activity.last.time_after_open = (activity.start_date - activity_open_date)/ms_in_min;
			activity.last.flex_time_up = Math.min(activity.last.flex_time_up, activity.last.max - activity.last.value);
			activity.last.flex_time_down = Math.min(activity.last.flex_time_down,activity.last.value - activity.last.min);

			//Update previous activities dates and flexibilities
			var c = 0; var previous_act; var fill;
			while (diff_beg > 0){ //Need to flex up in this case (because activity opens after date_cursor)
				previous_act = results[results.length - 1 - c];
				fill = Math.min(diff_beg, previous_act.last.local_flex_time_up);
				if(fill === 0){ c+= 1; continue; }
				update_activity_time_flexibilities(previous_act,fill,1);
				if(c > 0) update_subsequent_activities_dates(c,fill,1);
				//To make the while loop work
				diff_beg -= fill;
				c+= 1;
			}
			while (diff_end < 0){ //Need to flex down in this case (because date_cursor + last.min finishes after close_hour => activity is too long)
				previous_act = results[results.length - 1 - c];
				fill = Math.min( - diff_end, previous_act.last.local_flex_time_down);
				if(fill === 0){ c+= 1; continue; }
				update_activity_time_flexibilities(previous_act,fill,-1);
				if(c > 0) update_subsequent_activities_dates(c,fill,-1);
				//To make the while loop work
				diff_end += fill;
				c+= 1;
			}

			//Adding activity to result
			activity.locked = false;
			previous_day = day;
			add_activity_to_results(activity);
			console.log('global_flex_time_up : ' + global_flex_time_down);
			console.log('global_flex_time_down : ' + global_flex_time_down);

			console.log("total_time_amount : " + total_time_amount);
			console.log("RESULTS LENGTH : " + results.length);

			//Keeps a record of the best result in case roulette cannot be completed
			if(total_time_amount > best_results_so_far.total_time_amount){
				best_results_so_far.total_time_amount = total_time_amount;
				best_results_so_far.results = [];
				for(k=0;k<results.length;k++) best_results_so_far.results.push(new Object(results[k]));
			}
			//
			roulette_not_OK = (total_time_amount < roulette_time_amount);
			console.log('roulette_not_OK : ' + roulette_not_OK);
		}
		while(roulette_not_OK);
		
		console.log('roulette_not_OK : ' + roulette_not_OK);
		console.log("Results of activities : " + JSON.stringify(results));
		console.log("Date cursor : " + date_cursor);
		console.log("Total time amount : " + total_time_amount);
		console.log("Results Length : " + results.length);

		_.each(results,function(result,index){
			result.rank = index;
		});
		return results;
	},

	switch_activity: function(activity,activities_switched,profile,weather,max_radius){
		
		var new_activity;
		activity_to_switch = activity; //To define variable globally
		activities_switched_ids = activities_switched; //To define variable globally

		var min_rand = Activities.findOne({},{sort: {rand:1}}).rand;
		start_date = activity_to_switch.start_date; //Must be defined globally
		end_date = activity_to_switch.end_date; //Must be defined globally

		new_activity = get_activity("switch_result",max_radius,profile,weather);

		if(typeof new_activity === "undefined"){
			new_activity = "Il n'y a plus aucune autre activité";
		}
		else {
			new_activity.start_date = new Date(start_date);
			new_activity.end_date = new Date(end_date);
			new_activity.locked = false;
			new_activity.rank = activity_to_switch.rank;
			//Temporary fix
			new_activity.start_hour = new_activity.start_date.getHours();
			new_activity.start_minutes = new_activity.start_date.getMinutes();
			new_activity.end_hour = new_activity.end_date.getHours();
			new_activity.end_minutes = new_activity.end_date.getMinutes();

		}
		return new_activity;		
	},

	get_discoveries_and_transportation: function(legs){
	  var discoveries = [];

	  for (i = 0; i < legs.length; i++) {
	    var steps = legs[i].steps;

	    for (j = 0; j < steps.length; j++) {
	      var lat_lngs = steps[j].lat_lngs;
	      var discovery = null;

	      for (l = 0; l < lat_lngs.length; l++) {
	        discovery = Activities.findOne({
	          "classification.class": {
	            $in: ["Discovery"]
	          },
	          index: {
	            $near: {
	              $geometry: {
	                type: "Point",
	                coordinates: [lat_lngs[l].lng(), lat_lngs[l].lat()]
	              },
	              $maxDistance: 200 //Distance is in meters
	            }
	          }
	        });
	        if (discovery) break;
	      }
	      if (discovery) {
	        discoveries.push(Object(discovery));
	        break;
	      }
	    }
	  }
	  console.log(discoveries);
	  return discoveries;
	}
});

