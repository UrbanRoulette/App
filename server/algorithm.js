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

	lunchHours = [12,13,14];
	dinnerHours = [19,20,21];
	eatingHours = lunchHours.concat(dinnerHours);

	districts = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
	areas = [
			[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], //All districts (Paris)
			[1,2,3,4,5,6,7,8,9],
			[2,1,2,4,8,9,10,11],
			[3,1,2,4,11,10],
			[4,1,2,3,5,6,11,12,13],
			[5,1,4,6,13,12,14],
			[6,5,7,4,1,14,15],
			[7,1,6,15,8,16],
			[8,1,2,9,7,17,16],
			[9,2,10,18,17,8,1],
			[10,11,3,2,9,18,19],
			[11,10,3,4,12,20,19],
			[12,11,3,4,5,20,13],
			[13,12,4,5,6,14],
			[14,5,6,7,13,15],
			[15,6,7,14,16],
			[16,7,8,15],
			[17,18,9,2,1,8],
			[18,19,10,9,8,17],
			[19,20,11,10,18],
			[20,19,10,11,12,3,4]
			];

	nbActivities_perDistrict = {};
	nbActivities_perDistrict_Test = {};
	for (k=0; k < districts.length; k++){
		nbActivities_perDistrict[districts[k]] = 0;
		nbActivities_perDistrict_Test[districts[k]] = 0;
	}

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
	nbActivities_perType_Test = {};
	for (i=0; i < types.length; i++){
		nbActivities_perType[types[i]] = 0;
		nbActivities_perType_Test[types[i]] = 0;
	}
	//Redundant type system will use an identical but different object
	countRedundantTypes = {};
	for (i=0; i < types.length; i++)
		countRedundantTypes[types[i]] = 0;

	nbActivities_perTypeDistrict = {};
	nbActivities_perTypeDistrict_Test = {};
	for (k=0; k < areas[0].length; k++){
			var dKey = (areas[0])[k];
			for (i=0 ; i < types.length; i++){
				var number = Activities.find({$and: [{district: dKey}, {type: types[i]}]}).count();		
				nbActivities_perTypeDistrict[types[i] + dKey] = number;
				nbActivities_perTypeDistrict_Test[types[i] + dKey] = number;
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

	getMaxKeyValue = function(obj) {
		var max = 0;
		for (var key in obj) {
			if(max < obj[key])
				max = obj[key];
		}
		return max;
	};

	delete_Type_from_DistrictObj = function(obj,district,type){
		var val = obj[district][type];
		delete obj[district][type];
		for(var t in obj[district]){
			if(obj[district][t] > val)
				obj[district][t] -= nbActivities_perTypeDistrict_Test[type + district];	
			else if (obj[district][t] === val || obj[district][t] === 0)
				delete obj[district][t];
		}		
	};

	getValuefromIndex = function(array,obj,ind){
		var result;
		for(i=0; i < array.length; i++){
			if(obj[array[i]] > ind){
				result = array[i];
				break;
			}
		}
		return result;
	};
/*
	removeFromArray = function(arr) {
	    var what, a = arguments, L = a.length, ax;
	    while (L > 1 && arr.length) {
	        what = a[--L];
	        while ((ax= arr.indexOf(what)) !== -1) {
	            arr.splice(ax, 1);
	        }
	    }
	    return arr;
	};
*/

});

Meteor.methods({

	algorithm: function(startDate, timezoneOffset, district){

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
/*
		for (var districtNb in nbActivities_perDistrict) 
			nbActivities_perDistrict[districtNb] = 0;

		for (var type in nbActivities_perType) 
			nbActivities_perType[type] = 0;
*/
		area = areas[district];
		//Converted to string to look through indexes after that

//		nbActivities_Total = 0;
		
/*		track_DocsIndex = [];
		track_DocsIndex_perDistrict = {}; //Will check if all indexes possible for a district have already been randomly selected
		track_DocsIndex_perType = {};
		track_DocsIndex_perTypeDistrict = {};
*/
//		equiprobability_Districts_Test = [];
		equiprobability_Districts = {}; //Will contain all districts of the area (equiprobable)
		equiprobability_Types_perDistrict = {}; //Will contain an array with all types (equiprobable) present in the district
		ActivityNumbers_perTypeDistrict = {}; //Will contain, for each Type&District combination, an array of activity numbers : [1,2,3,4,..]

		//All _Test variables will be reinitilized when an activity is accepted as a result
		//During the loop, each time will be randomly selected in the _Test variable and withdrawn from it so that it is not selected at the next iteration
//		equiprobability_Districts_Test = [];
		equiprobability_Districts_Test = {};
		equiprobability_Types_perDistrict_Test = {};
		ActivityNumbers_perTypeDistrict_Test = {};
		ActivityNumbers_notOpenToday_perTypeDistrict = {};

		//
		countActivitiesDistrict = 0;
		//Putting values in the various variables declared right above
		for (k=0; k < area.length; k++){

			var d = area[k];
			equiprobability_Types_perDistrict[d] = {};
			equiprobability_Types_perDistrict_Test[d] = {};

			countActivitiesType = 0;

			for (i=0 ; i < types.length; i++){
				var t = types[i];
				var number = nbActivities_perTypeDistrict[t + d];
//				track_DocsIndex_perTypeDistrict[t + d] = [];
				nbActivities_perType[t] += number;
				nbActivities_perType_Test[t] += number;
				nbActivities_perDistrict[d] += number;
				nbActivities_perDistrict_Test[d] += number;
//				nbActivities_Total += number;

				countActivitiesType += number;
				equiprobability_Types_perDistrict[d][t] = countActivitiesType;
				equiprobability_Types_perDistrict_Test[d][t] = countActivitiesType;				

				ActivityNumbers_perTypeDistrict[t + d] = [];
				ActivityNumbers_perTypeDistrict_Test[t + d] = [];
				ActivityNumbers_notOpenToday_perTypeDistrict[t + d] = [];

				for (l=1; l <= number; l++){

					ActivityNumbers_perTypeDistrict[t + d].push(l);
					ActivityNumbers_perTypeDistrict_Test[t + d].push(l);
//					equiprobability_Types_perDistrict[d].push(t);
//					equiprobability_Types_perDistrict_Test[d].push(t);
				}			
			}

			countActivitiesDistrict += nbActivities_perDistrict[d];
			equiprobability_Districts[d] = countActivitiesDistrict;
			equiprobability_Districts_Test[d] = countActivitiesDistrict;
//			equiprobability_Districts.push(d);
//			equiprobability_Districts_Test.push(d);

//			track_DocsIndex_perDistrict[d] = [];
		}

		//To un-comment if not working with areas
//			nbActivities = Activities.find({district: district}).count();

		var districtRequired = district; //Useful to keep in a variable the original district that was requested by the user
		var lastDistrict = district;//Will know which was the district of the last activity suggested

		var rouletteResults = [];
		var resultsLength = 0;

		var track_ResultsIndex = []; //Will check if document has already been selected as a result

		var track_Types = []; //Will check that activities of the same types are not offered too closely
		var typesBelowGap = [];
		var typesForbidden = [];

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
		var security = 0;
		var loopDistrict = 0;
		var loopType = 0;
		var loopActivity = 0;
		
		benchmarkStart = new Date();
		
		day = weekday[start.getDay()];

		// ************** BEGINNING OF LOOP ************** //


		while (resultsLength < dayLength){ 

			security += 1;
			typesForbidden = [];

/*			if (security === 10000){
				console.log('Security break:' + security + ' attempts');
				break;
			}
*/			
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
					if (track_DocsIndex.indexOf(resultKept.index) === -1)
						track_DocsIndex.push(resultKept.index);

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

			//Check if we can reintegrate some excluded types that were suggested more than 'gap' ago
			
			typesBelowGap = [];
			//Determines types of activities that are too recent (REDUNDANT TYPES)
			for (k=0; k < track_Types.length; k++){

				var difference = start.getTime() - (track_Types[k].time).getTime();
				var ind = typesBelowGap.indexOf(track_Types[k].type);

				if (difference < gap*unit*60000 && ind === -1)
					typesBelowGap.push(track_Types[k].type);

				else if (difference >= gap*unit*60000 && ind > -1)
					typesBelowGap.splice(ind,1);			
			}	
			
			
			// ******** BEGINNING OF MAIN SUB LOOP ******** //
			var allChecks = true;

			do { //Loop for **** DISTRICTS ******

				loopDistrict += 1;
				console.log('loopDistrict : ' + loopDistrict);

//				if(loopDistrict > 10)
//					break;

				if (Object.keys(equiprobability_Districts_Test).length === 0) 
					break;

				if (nbActivities_perDistrict_Test[district] === 0 && district !== 0)
					district = lastDistrict;

				if (Object.keys(equiprobability_Types_perDistrict_Test[district]).length === 0 || nbActivities_perDistrict_Test[district] === 0){

					//If a district has no activity and is subsequent to current district
					var valueDistrict = equiprobability_Districts_Test[district];
					for(k=0; k < area.length; k++){
						if (equiprobability_Districts_Test[area[k]] === valueDistrict || equiprobability_Districts_Test[area[k]] === 0)
							delete equiprobability_Districts_Test[area[k]];				
					}

					for(var dt in equiprobability_Districts_Test){	
						if(area.indexOf(parseInt(dt)) > area.indexOf(district))
							equiprobability_Districts_Test[dt] -= nbActivities_perDistrict_Test[district];
					}

					console.log(equiprobability_Districts_Test);
					//Determines the possible number of activities given the previous tries
					var nbActivities_Possible_Districts = getMaxKeyValue(equiprobability_Districts_Test);

					console.log(nbActivities_Possible_Districts);

					var randomDistrictIndex = Math.floor(Math.random() * nbActivities_Possible_Districts);

//					district = getValuefromIndex(area,equiprobability_Districts_Test,randomDistrictIndex);	

					for(k=0;k < area.length; k++){
						if(equiprobability_Districts_Test[area[k]] > randomDistrictIndex){
							district = area[k];
							break;
						}
					}
					console.log('District : ' + district);

					if (Object.keys(equiprobability_Types_perDistrict_Test[district]).length === 0 || nbActivities_perDistrict_Test[district] === 0)
						continue;
				}

				//The variable districtStr will be used when constructing the random index below
				if (district < 10)
					districtStr = '0' + district;
				else
					districtStr = district.toString();

				//Removes REDUNDANT TYPES from equiprobability_Types_perDistrict_Test[district]
				for (k=0; k < typesBelowGap.length; k++){

					delete_Type_from_DistrictObj(equiprobability_Types_perDistrict_Test,district,typesBelowGap[k]);
/*					delete equiprobability_Types_perDistrict_Test[district][typesBelowGap[k]];
					for (var x in equiprobability_Types_perDistrict_Test[district]){
						if(types.indexOf(x) > types.indexOf(typesBelowGap[k]))
							equiprobability_Types_perDistrict_Test[district][x] -= nbActivities_perTypeDistrict_Test[typesBelowGap[k] + district];
					}		
*/				}

				//FOR RESTAURANTS
				hour = start.getHours();
				//Will absolutely require a Restaurant if it is eating time and he has not already eaten (or eaten more than 'gap' ago)
				if (eatingHours.indexOf(hour) > -1 && typesBelowGap.indexOf('Restaurant') === -1){
					for(i=0; i < types.length; i++) {
						if(types[i] !== 'Restaurant')
							delete equiprobability_Types_perDistrict_Test[area[k]][types[i]];
					}	
				}
				//Will absolutely exclude restaurant if it is NOT eating time (and that it has not yet been removed by typeBelowGap)
				else if (eatingHours.indexOf(hour) === -1 && typesBelowGap.indexOf('Restaurant') === -1){
					var typeForbidden = 'Restaurant';
					delete_Type_from_DistrictObj(equiprobability_Types_perDistrict_Test,district,typeForbidden);
/*					delete equiprobability_Types_perDistrict_Test[district][typeForbidden];
					for(var type in equiprobability_Types_perDistrict_Test[district]){
						if(types.indexOf(type) > types.indexOf(typeForbidden))
							equiprobability_Types_perDistrict_Test[district][type] -= nbActivities_perTypeDistrict_Test[typeForbidden + district];	
					}					
*/					typesForbidden.push(typeForbidden);	
				}

				/* To select random documents, see the following links:
					http://bdadam.com/blog/finding-a-random-document-in-mongodb.html
					http://stackoverflow.com/questions/20336361/get-random-document-from-a-meteor-collection
					http://stackoverflow.com/questions/2824157/random-record-from-mongodb
					http://stackoverflow.com/questions/13524641/how-to-get-random-single-document-from-1-billion-documents-in-mongodb-using-pyth

					Method with a 'rand' field in each doc (rand = Math.random()) and then a search with {rand:{$gt:r}, with r = Math.random() could be a good solution
				*/

				//Delete keys with value '0' which might still be there
				for (var typ in equiprobability_Types_perDistrict_Test[district]){
					if(equiprobability_Types_perDistrict_Test[district][typ] === 0)
						delete equiprobability_Types_perDistrict_Test[district][typ];
				}
				
				do { //Loop for **** TYPES ******

					loopType += 1;
					console.log('loopType : ' + loopType);

					if (Object.keys(equiprobability_Types_perDistrict_Test[district]).length === 0)
						break;

					//Determines the number of Activities possible in the district, given the previous tries with other types
					var nbActivities_Possible_Types_forDistrict = getMaxKeyValue(equiprobability_Types_perDistrict_Test[district]);
/*					var nbActivities_Possible_Types_forDistrict = 0;
					for (i=0; i < types.length; i++) {
						if(nbActivities_Possible_Types_forDistrict < equiprobability_Types_perDistrict_Test[district][types[i]])
							nbActivities_Possible_Types_forDistrict = equiprobability_Types_perDistrict_Test[district][types[i]];
					}
*/					
					randomTypeIndex = Math.floor(Math.random() * nbActivities_Possible_Types_forDistrict);
					
					//Locating the type chosen in the object
					randomType = getValuefromIndex(types,equiprobability_Types_perDistrict_Test[district],randomTypeIndex);
					console.log(randomType);
					randTypeNb = types.indexOf(randomType);
/*					for(i=0; i < types.length; i++){
						if(equiprobability_Types_perDistrict_Test[district][types[i]] > randomTypeIndex){
							randomType = types[i];
							randTypeNb = i;
							break;
						}
					}
*/					
					console.log('randTypeNb : ' + randTypeNb);
					//If a type has no activity and is subsequent to current random type, it will be deleted too
					delete_Type_from_DistrictObj(equiprobability_Types_perDistrict_Test,district,randomType);
/*					var valueType = equiprobability_Types_perDistrict_Test[district][randomType];
					for (i = 0; i < types.length; i++){
						if (equiprobability_Types_perDistrict_Test[district][types[i]] === valueType)
							delete equiprobability_Types_perDistrict_Test[district][types[i]];		
					}

					//Bringing values down given the type that has just been deleted
					for (var key in equiprobability_Types_perDistrict_Test[district]){
						if(types.indexOf(key) > types.indexOf(randomType))
							equiprobability_Types_perDistrict_Test[district][key] -= nbActivities_perTypeDistrict_Test[randomType + district];	
					}
*/
					if(randTypeNb < 10)
						randTypeNb = '0' + randTypeNb;
					else
						randTypeNb = randTypeNb.toString();

					
					do { //Loop for **** ACTIVITIES ******

						loopActivity += 1;
						console.log('loopActivity : ' + loopActivity);

						console.log(ActivityNumbers_perTypeDistrict_Test[randomType + district]);

						if (ActivityNumbers_perTypeDistrict_Test[randomType + district].length === 0)
							break;

						randActivityIndex = Math.floor(Math.random() * ((ActivityNumbers_perTypeDistrict_Test[randomType + district]).length));

						randActivityNb = (ActivityNumbers_perTypeDistrict_Test[randomType + district])[randActivityIndex];

						ActivityNumbers_perTypeDistrict_Test[randomType + district].splice(randActivityIndex,1);

						randomIndex = parseInt(randActivityNb + randTypeNb + districtStr);

						console.log('randActivityNb : ' + randActivityNb);
						console.log(randomIndex);

						// ***** BEGINNING OF TESTS *******

						if(track_ResultsIndex.indexOf(randomIndex) > -1)
							continue;

						doc = Activities.findOne({index: randomIndex});

						//
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
								openHours = openTime.substr(0,1);
								openMinutes = openTime.substr(2,3);
								open = new Date(startVar.setHours(openHours, openMinutes, 0));

								if(start.getTime() === open.getTime()){
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
							if((start < doc.startdate) || (start > doc.enddate))
							continue;
						}

						//Test: If weather is bad, does the activity requires sun?
						if(badWeather && doc.requiresun)
							continue;

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

			//Resets districts that have already been tested
			for(k=0; k < area.length; k++)
				equiprobability_Districts_Test[area[k]] = equiprobability_Districts[area[k]];

			//Resets day
			previousday = day;
			console.log('Previous day : '+ previousday);
			console.log('start : ' + startString);
			day = weekday[start.getDay()];
			console.log('Day : ' + day);

			//Resets tracking of activity numbers
			if(day !== previousday){
				for (k=0; k < area.length; k++){
					for (i=0 ; i < types.length; i++)
						ActivityNumbers_notOpenToday_perTypeDistrict[types[i] + area[k]] = [];
				}	
			}

			for (k=0; k < area.length; k++){

				for (i=0 ; i < types.length; i++){

					ActivityNumbers_perTypeDistrict_Test[types[i] + area[k]] = [];

					for(l=1; l <= nbActivities_perTypeDistrict[types[i] + area[k]]; l++){

						if((ActivityNumbers_notOpenToday_perTypeDistrict[types[i] + area[k]]).indexOf(l) === -1)
							ActivityNumbers_perTypeDistrict_Test[types[i] + area[k]].push(l);
					}
				}
			}

			for (k=0; k < districts.length; k++)
				nbActivities_perDistrict_Test[districts[k]] = 0;

			for (i=0; i < types.length; i++)
				nbActivities_perType_Test[types[i]] = 0;

			countActivitiesDistrict = 0;
			//Putting values in the various variables declared right above
			for (k=0; k < area.length; k++){

				var ds = area[k];
				countActivitiesType = 0;
				equiprobability_Types_perDistrict_Test[ds] = {};

				for (i=0; i < types.length; i++){
					var tp = types[i];
					var n = ActivityNumbers_perTypeDistrict_Test[tp + ds].length;

					nbActivities_perTypeDistrict_Test[tp + ds] = n;

					nbActivities_perType_Test[tp] += n;
					nbActivities_perDistrict_Test[ds] += n;
//						nbActivities_Total += n;

					countActivitiesType += n;
					equiprobability_Types_perDistrict_Test[ds][tp] = countActivitiesType;				
		
				}
				countActivitiesDistrict += nbActivities_perDistrict_Test[ds];
				equiprobability_Districts_Test[ds] = countActivitiesDistrict;
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
				security: security,
				message: message
				};
	}
});

