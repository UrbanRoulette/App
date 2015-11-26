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
		if (quotient === 0) date.setHours(h,m,0,0); //Date does not change
		else if((quotient + 1) === 60/pace) date.setHours(h+1,0,0,0); //Important to set seconds and milliseconds to 0!
		else date.setHours(h,(quotient+1)*pace,0,0);
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
		if(hour_integer === 0) hour_string = "0000";
		else if(hour_integer < 100) hour_string = "00" + hour_integer.toString();
		else if(hour_integer < 1000) hour_string = "0" + hour_integer.toString();
		else hour_string = hour_integer.toString();
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
		return related_opening_hours_integer_of_activity; //returns hour_integers
	};
	update_local_and_global_flex = function(results){

		global_flex_time_up = 0;
		global_flex_time_down = 0;

		for(k=0; k < results.length; k++){

			var a = results[k];

			a.last.local_flex_time_up = Math.min(a.last.flex_time_up, a.last.time_before_end);
			a.last.local_flex_time_down = (k < results.length - 1) ? Math.min(a.last.flex_time_down, results[k+1].last.time_after_start) : a.last.flex_time_down;

			global_flex_time_up = Math.min(global_flex_time_up + a.last.flex_time_up, a.last.time_before_end);
			global_flex_time_down = (k === 0) ? a.last.flex_time_down : a.last.flex_time_down + Math.min(global_flex_time_down, a.last.time_after_start);

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
		previous_act.last.time_before_end -= sign*fill;
	};
	update_subsequent_activities_dates = function(c,fill,sign){
		for(j=results.length - c; j < results.length; j++){
			var act = results[j];
			//
			act.last.time_after_start += sign*fill;
			act.start_date = new Date(act.start_date.getTime() + sign*fill*ms_in_min);
			//
			act.last.time_before_end -= sign*fill;
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
		if(!activity.locked) types_excluded.push(activity.type); //We already excluded the type of locked activities at the beginning of the algorithm
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
		types_excluded.splice(types_excluded.indexOf(last_activity.type),1);
		date_cursor = new Date(date_cursor.getTime() - last_activity.last.value*ms_in_min);
	};
	require_type = function(type){
		types_required = [];
		types_required.push(type);
		var ind = types_excluded.indexOf(type);
		if(ind > -1)
			types_excluded.splice(ind,1);
	};
	exclude_type = function(type){
		if(types_excluded.indexOf(type) === -1) types_excluded.push(type);
		var ind = types_required.indexOf(type);
		if(ind > -1) types_required.splice(ind,1);
	};
});

Meteor.methods({

	get_activities_results: function(center,radius,date,profile,timezoneOffset,activities_locked){

		//INITIALIZATION
//		var activities_locked = [];		
		var lat = center.lat;
		var lng = center.lng;
//		var profile = ["gratuit", "cheap", "exterieur", "curieux", "couple", "solo", "potes", "prestige"];
		var requiresun = false;

		//DATE CURSOR
		date = new Date(date.getTime() - timezoneOffset*ms_in_min);
		date.setHours(12,29,0,0);
		date_cursor = round_date_to_pace_date(date,pace); //Must be defined globally
		var date_cursor_start = new Date(date_cursor);
		var date_cursor_end = new Date(date_cursor.getTime() + roulette_time_amount*ms_in_min);
		var day = convert_day_number_to_foursquare_day_number(date_cursor.getDay());
		var previous_day = day;
		//
		var min_rand = Activities.findOne({},{sort: {rand:1}}).rand;

		//TRACKING
		//RESULTS TRACKING
		track_results_id = []; //Must be defined globally
		track_unwanted_id = {}; //Must be defined globally
		for(j=0;j < activities_length;j++) track_unwanted_id[j] = [];
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
		lock_index = 0; //Must be defined globally
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

			nb_slots_to_fill = 0; //Necessary
			for (k=0;k<activities_locked.length;k++){

				var act_locked = activities_locked[k];
				act_locked.locked = true;
				exclude_type(act_locked.type);
				
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
			var random = Math.random();

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
			var max_nb_of_activities_for_this_slot = (activities_length - results.length - (activities_locked.length - lock_index)) - (nb_slots_to_fill - slot_index) + 1;
			
			console.log('max_nb_of_activities_for_this_slot : ' + max_nb_of_activities_for_this_slot);
			console.log('slot_index : ' + slot_index);
			console.log("date_cursor : " + date_cursor);
			console.log("RESULT LEVEL : " + result_level);
			console.log('lock_index : ' + lock_index);
			console.log("end_point");
			console.log(end_point);
			
			//
			day = convert_day_number_to_foursquare_day_number(date_cursor.getDay());
			var end_point = end_points[lock_index];
			var end_point_hour_integer = (end_point.getHours() < date_cursor.getHours()) ? convert_date_to_hour_integer(end_point) + 2400 : convert_date_to_hour_integer(end_point);
			var time_before_next_end_point = (end_point.getTime() - date_cursor.getTime())/ms_in_min;

			console.log(end_point_hour_integer);
			var hour_integer_cursor = (previous_day !== day) ? convert_date_to_hour_integer(date_cursor) + 2400 : convert_date_to_hour_integer(date_cursor);
			var adjusted_start_hour_cursor = add_time_amount_to_hour_integer(hour_integer_cursor, global_flex_time_up);
			var adjusted_end_hour_cursor = add_time_amount_to_hour_integer(hour_integer_cursor, - global_flex_time_down);

			//FOR TYPES
			//Initialize required types with all existing types
			types_required = activity_types;
			//Restaurant
			type_considered = 'restaurant';
			var hour = date_cursor.getHours();
			if (eatingHours.indexOf(hour) > -1 && types_excluded.indexOf(type_considered) === -1 && (profile.indexOf('gratuit') === -1 || profile.length > 1)) require_type(type_considered);
			else exclude_type(type_considered);
			//Sport
			type_considered = "sport";
			if(results.length > 0) exclude_type(type_considered);

			console.log(types_excluded);
			console.log(types_required);				
			console.log("RESULT LEVEL just avant QUERY: " + result_level);


			do {
				//Not necessary but will avoid an activity too short to be picked if this is the last activity
	//				var last_doc_query = {};
	//				if(results.length === activities_length - 1)
	//					last_doc_query = {$where: function(){return ((end_point.getTime() - this.opening_hours.end_minus_last_min*ms_in_min) <= this.last.last_min*ms_in_min)}};
				
				//QUERY
				var last_doc_query = (max_nb_of_activities_for_this_slot === 1) ? {"last.max": {$gte: time_before_next_end_point}, end: {$gte: end_point_hour_integer}} : {};
				var query = {
							$and: 
								[
									{
										_id: { $nin: track_unwanted_id[result_level].concat(track_results_id) },
										index : { $geoWithin: { $centerSphere : [ [ lng, lat ] , radius ] } }, //Initial point
			//							index : { $geoWithin: { $centerSphere : [ [ lng, lat ] , radius ] } }, //Previous activity point
										rand: { $gte: random },
										type: { $in: types_required, $nin: types_excluded },
										profile: { $in: profile },	
										opening_hours: { $elemMatch: { days: {$in: [day]}, 
																	open: {$elemMatch: 
																		{
																		start: {$lte: adjusted_start_hour_cursor}, //Make sure activity is open
																		start_plus_last_min: {$lte: end_point_hour_integer}, //Make sure activity is not starting too late
																		end_minus_last_min: {$gte: adjusted_end_hour_cursor}, //Make sure activity won't close too early (ie it will still be open if we had last.min do date_cursor)
																	//	end_minus_last_min: {$lte: end_point_hour_integer - adjusted_end_hour_cursor}
																		} 
																	} } },	
									"last.min": {$lte: time_before_next_end_point + global_flex_time_down} //Avoid too long activities
	//								requiresun: requiresun
									}, 
									{$or: [
											{ startdate: {$lte: date_cursor}, enddate: {$gte: date_cursor} },
											{ startdate: {$exists: false}, enddate: {$exists: false} }
										]
									},
									last_doc_query
								]	
							};

				activity = Activities.findOne({$query: query, $orderby: { rand: 1 } } );

				if(random > min_rand) random = random * Math.random(); 
				else {
					if(typeof activity === "undefined"){
						track_unwanted_id[result_level] = [];
						if(result_level > 0){remove_last_activity_from_results(); continue Algorithm;}
						else { results = best_results_so_far.results; break Algorithm;}
					}
				}
			}
			while(typeof activity === "undefined");

			console.log("ACTIVTY NAME: " + activity.name);
			
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

			//Define fields related to flexibility
			activity.last.time_before_end = (activity_close_date - activity.end_date)/ms_in_min;
			activity.last.time_after_start = (activity.start_date - activity_open_date)/ms_in_min;
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
		return results;
	},
});

