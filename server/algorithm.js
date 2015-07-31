Meteor.startup(function(){
	//Parameters
	pace = 15; // Pace (in number of minutes) (must divide 60)
	unit = 1; //Unit for the last of each activity in database (in number of minutes)
	dayLength = 6*60; //Length of day (in number of unit). Ex: If unit=30 (ie half-hour), then dayLength = 2 means 1 hour
	gap = 6*60; //Gap between two activities (in number of unit). During this gap, activity of the same category will not be offered, unless it has been randomly chosen more than var 'luck' times 
	luck = 5; //Number of tries from which an activity can appear even if it is redundant

	//Variables
	weekday = new Array(7);
	weekday[0]=  "sunday";
	weekday[1] = "monday";
	weekday[2] = "tuesday";
	weekday[3] = "wednesday";
	weekday[4] = "thursday";
	weekday[5] = "friday";
	weekday[6] = "saturday";

	lunchHours = [12,13];
	dinnerHours = [19,20];
	eatingHours = lunchHours.concat(dinnerHours);

	districts = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,99];//All districts

	areas = [
			[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,99], //Paris (all districts)
			[1,2,3,4,5,6,7,8,9,99],
			[2,1,2,4,8,9,10,11,99],
			[3,1,2,4,11,10,99],
			[4,1,2,3,5,6,11,12,13,99],
			[5,1,4,6,13,12,14,99],
			[6,5,7,4,1,14,15,99],
			[7,1,6,15,8,16,99],
			[8,1,2,9,7,17,16,99],
			[9,2,10,18,17,8,1,99],
			[10,11,3,2,9,18,19,99],
			[11,10,3,4,12,20,19,99],
			[12,11,3,4,5,20,13,99],
			[13,12,4,5,6,14,99],
			[14,5,6,7,13,15,99],
			[15,6,7,14,16,99],
			[16,7,8,15,99],
			[17,18,9,2,1,8,99],
			[18,19,10,9,8,17,99],
			[19,20,11,10,18,99],
			[20,19,10,11,12,3,4,99],
			[99]
			];

	nbActivities_perDistrict = {};		

	types = ['Balade',
				'Bar',
				'Boite',
				'Cinéma',
				'Concert',
				'Divers',
				'Evasion',
				'Evènement',
				'Insolite',
				'Jeux',
				'Lecture',
				'Musée',
				'Musique',
				'Petit-dej ou goûter',
				'Restaurant',
				'Shopping',
				'Sport',
				'Théâtre',
				'Visite'
				];

	nbActivities_perType = {};
	//Redundant type system will use an identical but different object
	countRedundantTypes = {};


	nbActivities_perTypeDistrict = {};
	nbActivities_perTypeDistrict_inLoop = {};
	copies_Activities_perTypeDistrict = {};
	requiresun_Activities_perTypeDistrict = {};

	for (k=0; k < districts.length; k++){
			var dKey = districts[k];
			
			for (i=0 ; i < types.length; i++){

				copies_Activities_perTypeDistrict[types[i] + dKey] = {};
				requiresun_Activities_perTypeDistrict[types[i] + dKey] = {};

				var number = 0;
				Activities.find({$and: [{district: dKey}, {type: types[i]}]}).forEach(function(doc){ 
					number += 1;
					copies_Activities_perTypeDistrict[types[i] + dKey][number] = doc.copies;
					requiresun_Activities_perTypeDistrict[types[i] + dKey][number] = doc.requiresun;
				});	// jshint ignore:line

				nbActivities_perTypeDistrict[types[i] + dKey] = number;
				nbActivities_perTypeDistrict_inLoop[types[i] + dKey] = number;
			}
	}

	//Functions
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

	createActivityObject = function(doc){

		metrostation = null;
		if (typeof doc.metrostation !== 'undefined'){
			var stations = doc.metrostation;
			var nbstations = stations.length;
			if (nbstations === 1)
				metrostation = stations[0];
			else if (nbstations > 1){
				metrostation = stations[0];
				for (k=1; k < nbstations - 1; k++){
					metrostation = metrostation + ', ' + stations[k];
				}
				metrostation = metrostation + ' ou ' + stations[nbstations - 1];
			}	
		}
		var activity = {
		_id: doc._id,
		specific: doc.specific,
		name: doc.name,
		address: doc.address,
		district: doc.district,
		metrostation: metrostation,
		description: doc.description,
		type: doc.type,
		price: doc.price,
		mark: doc.mark,
		link: doc.link,
		contact: doc.contact,
		image: doc.image,
		index: doc.index,
		startString: startString,
		startTime: start,
		endString: endString,
		endTime: end,
		last: doc.last
	};
		return activity;
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

	delete_Item_from_Equiprobability_Obj = function(obj,item,nb){
		var val = obj[item];
		delete obj[item];
		for(var t in obj){
			if(obj[t] > val)
				obj[t] -= nb;	
			else if (obj[t] === val || obj[t] === 0)
				delete obj[t];
		}		
	};

	get_randomItem_from_Equiprobability_Obj = function(array,obj){
		var max = 0;
		var result;
		for (var key in obj) {
			if(max < obj[key])
				max = obj[key];
		}		
		for(i=0; i < array.length; i++){
			if(obj[array[i]] > (Math.random() * max)){
				result = array[i];
				break;
			}
		}
		return result;
	};

});

Meteor.methods({

	algorithm: function(startDate, timezoneOffset, district){

		benchmarkStart = new Date();

		check(startDate, Date);
		check(timezoneOffset, Number);
		check(district, Match.Optional(Number));
//		check(resultsKeptSessionVar,[Object]);

		//About TIME DIFFERENCES BETWEEN CLIENT AND SERVER
			//http://stackoverflow.com/questions/1201378/how-does-datetime-touniversaltime-work
			//http://stackoverflow.com/questions/25367789/can-i-make-node-js-date-always-be-in-utc-gmt
			//http://stackoverflow.com/questions/23112301/gettimezoneoffset-method-return-different-time-on-localhost-and-on-server
			//http://stackoverflow.com/questions/18014341/how-to-convert-time-correctly-across-timezones?rq=1
			//We can also use moment.js (client and server): http://momentjs.com/docs/#/manipulating/utc/
			
		startDate = new Date(startDate.getTime() - timezoneOffset*60000); //Note: getTime() is UTC by essence, always.
		start = roundTime(startDate, pace);

		var indexOfdistrict = districts.indexOf(district);
		area = areas[indexOfdistrict];
		//Converted to string to look through indexes after that

		ActivityNumbers_perTypeDistrict = {}; //Will contain, for each Type&District combination, an array of activity numbers : [1,2,3,4,..]
		ActivityNumbers_notOpenToday_perTypeDistrict = {};
		ActivityNumbers_closePeriod_perTypeDistrict = {};

		equiprobability_Types_perDistrict = {}; //Will contain an array with all types (equiprobable) present in the district	
		//Activities according to weather	
		equiprobability_all_Activities_perTypeDistrict = {};
		equiprobability_requiresun_Activities_perTypeDistrict = {};
		equiprobability_other_Activities_perTypeDistrict = {};

		//Initializing loop
		for (k=0; k < area.length; k++){

			var d = area[k];

			for (i=0 ; i < types.length; i++){

				var t = types[i];

				ActivityNumbers_perTypeDistrict[t + d] = [];
				ActivityNumbers_notOpenToday_perTypeDistrict[t + d] = [];
				ActivityNumbers_closePeriod_perTypeDistrict[t + d] = [];

				equiprobability_all_Activities_perTypeDistrict[t + d] = {};
				equiprobability_requiresun_Activities_perTypeDistrict[t + d] = {};
				equiprobability_other_Activities_perTypeDistrict[t + d] = {};

				var number = nbActivities_perTypeDistrict[t + d];
				for (l=1; l <= number; l++)
					ActivityNumbers_perTypeDistrict[t + d].push(l);					
			}
		}

		var districtRequired = district; //Useful to keep in a variable the original district that was requested by the user
		var lastDistrict = district;//Will know which was the district of the last activity suggested

		var rouletteResults = [];
		var resultsLength = 0;
		var track_ResultsIndex = []; //Will check if document has already been selected as a result

		var track_Types = []; //Will check that activities of the same types are not offered too closely
		var typesBelowGap = [];

		//!! Only one weather variable can be true
		var normalWeather = true;
		var goodWeather = false;
		var badWeather = false;

		var check3 = false;
		var check4 = false;

		//RESULTS KEPT: In order to have the right order of the results kept
		//Current code will NOT WORK server side. See if mrt:client-call package can help...
/*		if (resultsKeptSessionVar){
			var array = resultsKeptSessionVar;
			resultsKept = array.sort(function(a,b){return ((a.startTime).getTime() - (b.startTime).getTime());});
			for(k=0; k < resultsKept; k++)
				track_ResultsIndex.push((resultsKept[k]).index); 
			resultsKeptIndex = 0;
		}
*/	
		day = weekday[start.getDay()];

		// ************** BEGINNING OF LOOP ************** //

		while (resultsLength < dayLength){ 

			//IF SOME RESULTS HAVE BEEN KEPT
/*			if((typeof resultsKept !== 'undefined') && (resultsKeptIndex < resultsKept.length)){

				resultKept = resultsKept[resultsKeptIndex];
				startTime = new Date(resultKept.startTime);

				//If it starts at the same moment ('=') than a kept activity, skips the time slot
				//There is also the '>', in case the first activity is kept at 11:59 and roulette is rerun at 12:00 for instance
				if (start.getTime() >= startTime.getTime()){

					rouletteResults.push(resultKept);
					track_Types.push({
						type: resultKept.type,
						time: start
					});

					//Skips the time slot of the activity that was kept
					start = new Date(resultKept.endTime); 
					resultsLength += resultKept.last;  
					resultsKeptIndex += 1;
					continue;
				}
				
				else {
					endTest = new Date(start.getTime() + unit*60000*doc.last);
					if (endTest < startTime)
						check3 = true;
					else if (endTest.getTime() === startTime.getTime())
						check4 = true;
					else
						continue;			
				}
			}
			else
*/				check3 = true;

			//Putting values in variables
			equiprobability_Districts = {};
			count_equiprobability_Districts = 0;

			for (k=0; k < area.length; k++){

				var ds = area[k];

				nbActivities_perDistrict[ds] = 0;

				count_equiprobability_Types = 0;
				equiprobability_Types_perDistrict[ds] = {};

				for (i=0; i < types.length; i++){

					var tp = types[i];
					var n = ActivityNumbers_perTypeDistrict[tp + ds].length;

					if(k === 0){
						nbActivities_perType[tp] = 0;
	//					countRedundantTypes[tp] = 0;
					}
					
					nbActivities_perType[tp] += n;
					nbActivities_perDistrict[ds] += n;
					nbActivities_perTypeDistrict_inLoop[tp + ds] = n;
					
					if (n > 0){
						count_equiprobability_Types += n;
						equiprobability_Types_perDistrict[ds][tp] = count_equiprobability_Types;
					}	

					count_equiprobability_requiresun_Activities = 0;
					count_equiprobability_other_Activities = 0;

					for (l=1; l <= n; l++){

						ActivityNumbers_perTypeDistrict[tp + ds].push(l);
						var sunBoolean = requiresun_Activities_perTypeDistrict[tp + ds][l];

						if(sunBoolean){
							count_equiprobability_requiresun_Activities += copies_Activities_perTypeDistrict[tp + ds][l];
							equiprobability_requiresun_Activities_perTypeDistrict[tp + ds][l] = count_equiprobability_requiresun_Activities;
						}
						else {
							count_equiprobability_other_Activities += copies_Activities_perTypeDistrict[tp + ds][l];
							equiprobability_other_Activities_perTypeDistrict[tp + ds][l] = count_equiprobability_other_Activities;
						}
						equiprobability_all_Activities_perTypeDistrict[tp + ds][l] = count_equiprobability_requiresun_Activities + count_equiprobability_other_Activities;

					}		
		
				}
				count_equiprobability_Districts += nbActivities_perDistrict[ds];
				if(nbActivities_perDistrict[ds] > 0)
					equiprobability_Districts[ds] = count_equiprobability_Districts;
			}

			typesBelowGap = [];
			//Determines types of activities that are too recent (i.e below 'gap' time)
			for (k=0; k < track_Types.length; k++){

				var difference = start.getTime() - (track_Types[k].time).getTime();
				var ind = typesBelowGap.indexOf(track_Types[k].type);

				if (difference < gap*unit*60000 && ind === -1)
					typesBelowGap.push(track_Types[k].type);

				else if (difference >= gap*unit*60000 && ind > -1)
					typesBelowGap.splice(ind,1);			
			}	
					
			// ******** BEGINNING OF SUB LOOP ******** //
			var allChecks = true;

			do { //Loop for **** DISTRICTS ******
				
				delete_Item_from_Equiprobability_Obj(equiprobability_Districts,district,nbActivities_perDistrict[district]);

				if (Object.keys(equiprobability_Districts).length === 0) 
					break;

				if (Object.keys(equiprobability_Types_perDistrict[district]).length === 0){

					//Search in priority in the previous result's district, if district required has no more activity (unless district === 0, which means all city)
					if (Object.keys(equiprobability_Types_perDistrict[lastDistrict]).length !== 0 && district !== 0)
						district = lastDistrict;
					//Determines new district
					else 
						district = get_randomItem_from_Equiprobability_Obj(area,equiprobability_Districts);
				}

				//The variable districtStr will be used when constructing the random index below
				if (district < 10)
					districtStr = '0' + district;
				else
					districtStr = district.toString();

				//Removes REDUNDANT TYPES from equiprobability_Types_perDistrict[district]
				for (k=0; k < typesBelowGap.length; k++)
					delete_Item_from_Equiprobability_Obj(equiprobability_Types_perDistrict[district],typesBelowGap[k],nbActivities_perTypeDistrict_inLoop[typesBelowGap[k] + district]);				

				//FOR RESTAURANTS
				hour = start.getHours();
				var typeTreated = 'Restaurant';
				//Will absolutely require a Restaurant if it is eating time and he has not already eaten (or eaten more than 'gap' ago)
				if (eatingHours.indexOf(hour) > -1 && typesBelowGap.indexOf(typeTreated) === -1){
					for(i=0; i < types.length; i++) {
						if(types[i] !== typeTreated)
							delete equiprobability_Types_perDistrict[district][types[i]];
					}	
				}
				//Will absolutely exclude restaurant if it is NOT eating time (and that it has not yet been removed by typeBelowGap)
				else if (eatingHours.indexOf(hour) === -1 && typesBelowGap.indexOf(typeTreated) === -1)
					delete_Item_from_Equiprobability_Obj(equiprobability_Types_perDistrict[district],typeTreated,nbActivities_perTypeDistrict_inLoop[typeTreated + district]);

				/* To select random documents, see the following links:
					http://bdadam.com/blog/finding-a-random-document-in-mongodb.html
					http://stackoverflow.com/questions/20336361/get-random-document-from-a-meteor-collection
					http://stackoverflow.com/questions/2824157/random-record-from-mongodb
					http://stackoverflow.com/questions/13524641/how-to-get-random-single-document-from-1-billion-documents-in-mongodb-using-pyth

					Method with a 'rand' field in each doc (rand = Math.random()) and then a search with {rand:{$gt:r}, with r = Math.random() could be a good solution
				*/
			
				do { //Loop for **** TYPES ******

					if (Object.keys(equiprobability_Types_perDistrict[district]).length === 0)
						break;

					//Determines random type
					randomType = get_randomItem_from_Equiprobability_Obj(types,equiprobability_Types_perDistrict[district]);
					delete_Item_from_Equiprobability_Obj(equiprobability_Types_perDistrict[district],randomType,nbActivities_perTypeDistrict_inLoop[randomType + district]);

					randomTypeNb = types.indexOf(randomType);
					if(randomTypeNb < 10)
						randomTypeNb = '0' + randomTypeNb;
					else
						randomTypeNb = randomTypeNb.toString();
					
					var sun_obj = equiprobability_requiresun_Activities_perTypeDistrict[randomType + district];
					var other_obj = equiprobability_other_Activities_perTypeDistrict[randomType + district];
					var all_obj = equiprobability_all_Activities_perTypeDistrict[randomType + district];
					
					do { //Loop for **** ACTIVITIES ******

						if (Object.keys(all_obj).length === 0 || (Object.keys(sun_obj).length === 0 && Object.keys(other_obj).length === 0))
							break;

						if (goodWeather && Object.keys(sun_obj).length !== 0) {
							randActivityNb = get_randomItem_from_Equiprobability_Obj(ActivityNumbers_perTypeDistrict[randomType + district], sun_obj);
							delete_Item_from_Equiprobability_Obj(sun_obj,randActivityNb,copies_Activities_perTypeDistrict[randomType + district][randActivityNb]);
						}
						else if (goodWeather || badWeather) {
							randActivityNb = get_randomItem_from_Equiprobability_Obj(ActivityNumbers_perTypeDistrict[randomType + district], other_obj);
							delete_Item_from_Equiprobability_Obj(other_obj,randActivityNb,copies_Activities_perTypeDistrict[randomType + district][randActivityNb]);
						}
						else if (normalWeather) {
							randActivityNb = get_randomItem_from_Equiprobability_Obj(ActivityNumbers_perTypeDistrict[randomType + district], all_obj);
							delete_Item_from_Equiprobability_Obj(all_obj,randActivityNb,copies_Activities_perTypeDistrict[randomType + district][randActivityNb]);
						}

						randomIndex = parseInt(randActivityNb + randomTypeNb + districtStr);

						// ***** BEGINNING OF TESTS *******
						if(track_ResultsIndex.indexOf(randomIndex) > -1)
							continue;

						doc = Activities.findOne({index: randomIndex});

						if(typeof doc[day] === 'undefined'){
							ActivityNumbers_notOpenToday_perTypeDistrict[randomType + district].push(randActivityNb);
							continue;
						}

						//Test: If activity is open during the time slot considered
						var check2 = false;
						var docday = doc[day];
						startVar = new Date(start); //Important to create a NEW Date Object

						for (k=0; k < docday.length; k++){

							var openingHours = docday[k].split("-");

							if (openingHours.length === 2){ //Check if there is an open AND a close hour

								openTime = openingHours[0];
								openHours = openTime.substr(0,2);
								openMinutes = openTime.substr(2,2);
								open = new Date(startVar.setHours(openHours,openMinutes,0,0));

								closeTime = openingHours[1];
								closeHours = closeTime.substr(0,2);
								closeMinutes = closeTime.substr(2,2);
								close = new Date(startVar.setHours(closeHours,closeMinutes,0,0));
								//So that people have time to do the activity, close time is effective hour of close minus the last of the activity
								close = new Date(close.getTime() - unit*60000*doc.last);

								//Deals with '2359' case
								if (closeHours === '23' && closeMinutes === '59'){
									
									close = new Date(close.getTime() + 60000*60*24); //Adds 24h
									nextDayHours = doc[weekday[close.getDay()]];
									closeTime = '0000';

									if (typeof nextDayHours !== 'undefined'){
										for (i=0; i < nextDayHours.length; i++){
											if(nextDayHours[i].indexOf('0000') !== -1){
												closeTime = nextDayHours[i].slice(-4);
												break;
											}
										}
									}
									closeHours = closeTime.substr(0,2);
									closeMinutes = closeTime.substr(2,2);
									close.setHours(closeHours,closeMinutes,0,0);
									close = new Date(close.getTime() - unit*60000*doc.last);
									
								}

								if ((start >= open) && (start <= close)) {
										check2 = true;
										break;
									}
							}

							//In case there is only one start hour (for movies, ...)
							else {
								openTime = docday[k];
								openHours = openTime.substr(0,2);
								openMinutes = openTime.substr(2,2);
								open = new Date(startVar.setHours(openHours, openMinutes, 0));

								if(start.getTime() <= open.getTime() && (start.getTime() + pace*60000) > open.getTime()){
									check2 = true;
									break;
								}
							}	
						}

						//Result of test
						if (!check2)
							continue;

						//Test: If activity is open during this period of the year
						if((typeof doc.startdate !== 'undefined') && (typeof doc.enddate !== 'undefined')){
							if((start < doc.startdate) || (start > doc.enddate)) {
								ActivityNumbers_closePeriod_perTypeDistrict[randomType + district].push(randActivityNb);
								continue;
							}
						}

						allChecks = false;
					}
					while (allChecks);
				}
				while (allChecks);
			}
			while (allChecks);

			if (allChecks)
				break;

			//Creates end Date object, and Start and End strings
			if (check3 || check4){
				startString = timeString(start);
				end = new Date(start.getTime() + unit*60000*doc.last); //We add time to the timestamp
				endString = timeString(end);

				rouletteResults.push(createActivityObject(doc));
				track_ResultsIndex.push(doc.index);
				track_Types.push({
					type: doc.type,
					time: start
				});
				resultsLength += doc.last;
			}

			if (check3){  //If the randomly chosen activity is open at start
				start = new Date(end);
			}

			if (check4) {
				//Skips the time slot of the activity that was kept
				rouletteResults.push(resultKept); 
				start = new Date(end.getTime() + unit*60000*resultKept.last); 
				resultsLength += resultKept.last;
				resultsKeptIndex += 1;
			}

			//Resets variables to monitor probability of events to appear - (can be placed right after Redundant place or right after the last test (at the end of the loop), with different effect on probability)
/*			for (i=0;i < types.length; i++) 
				countRedundantTypes[types[i]] = 0;
*/
			//Resets district to the original district required by the user
			lastDistrict = district;
			district = districtRequired;

			//Resets day
			previousday = day;
			day = weekday[start.getDay()];

			for (k=0; k < area.length; k++){

				for (i=0 ; i < types.length; i++){

					ActivityNumbers_perTypeDistrict[types[i] + area[k]] = [];

					//Resets tracking of activity numbers if day has changed
					if(day !== previousday){
						ActivityNumbers_notOpenToday_perTypeDistrict[types[i] + area[k]] = [];
						ActivityNumbers_closePeriod_perTypeDistrict[types[i] + area[k]] = [];	
					}

					for(l=1; l <= nbActivities_perTypeDistrict[types[i] + area[k]]; l++){

						var test1 = ActivityNumbers_notOpenToday_perTypeDistrict[types[i] + area[k]].indexOf(l);
						var test2 = ActivityNumbers_closePeriod_perTypeDistrict[types[i] + area[k]].indexOf(l);

						if(test1 === -1 && test2 === -1)
							ActivityNumbers_perTypeDistrict[types[i] + area[k]].push(l);
					}
				}
			}
		}

		if(resultsLength < dayLength){
			console.log('Boucle avortée');
			message = 'Il n\'y avait plus d\'activité pertinente à proposer au-delà de ' + endString;
		}
		else
			message = 'Roulette complète';

		benchmarkEnd = new Date();
		benchmark = benchmarkEnd.getTime() - benchmarkStart.getTime();

		return {rouletteResults: rouletteResults, 
				benchmark: benchmark, 
				message: message
				};
	}
});

