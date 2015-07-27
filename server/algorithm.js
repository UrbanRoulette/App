Meteor.startup(function(){
	//Parameters
	pace = 15; // Pace (in number of minutes) (must divide 60)
	unit = 1; //Unit for the last of each activity in database (in number of minutes)
	dayLength = 8*60; //Length of day (in number of unit). Ex: If unit=30 (ie half-hour), then dayLength = 2 means 1 hour
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
});

Meteor.methods({

	algorithm: function(startDate, timezoneOffset, district){

		if (district === "Paris")
			district = 0;

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

		if (typeof district !== 'undefined'){
			//To work with areas
			area = areas[district];
			areaSize = area.length; 
			nbActivitiesArray = [];
			nbActivitiesTotal = 0;
//			allOtherIndexesOfArea = [];
			for (k=0; k < areaSize; k++){
				var districtNumber = area[k];
				var number = Activities.find({district: districtNumber}).count();
				nbActivitiesArray.push(number);	
				nbActivitiesTotal += number;
/*				Activities.find({district: districtNumber}).forEach(function(doc){
					allOtherIndexesOfArea.push(doc.district);
				});	
*/			}
			nbActivities = nbActivitiesArray[0];
			//End of code for areas

			//To un-comment if not working with areas
//			nbActivities = Activities.find({district: district}).count();
			
			//Converted to string to look through indexes after that
			if (district < 10)
				district = '0' + district;
		}
		else {
			nbActivities = Activities.find().count();
			nbActivitiesTotal = nbActivities;	
		}

		start = roundTime(startDate, pace);

		var rouletteResults = [];
		var resultsLength = 0;
		var trackDocsIndex = []; //Will check if all elements have been tried. If yes, breaks the 'while' loop
		var lastDoc = false; 
		var trackResultsId = []; //Will check if document has already been selected as a result
		var trackTypes = []; //Will check that activities of the same types are not offered too closely

		var badWeather = false;

		//Variables to monitor probability of events to appear
		var countRedundantTypes = {
			'Restaurant': 0,
			'Petit-dej ou goûter': 0,
			'Bar': 0,
			'Cinéma': 0,
			'Sport': 0,
			'Boite': 0,
			'Théâtre': 0,
			'Musée': 0,
			'Viste': 0,
			'Balade': 0,
			'Jeux': 0,
			'Concert':0,
			'Evènement': 0,
			'Musique': 0,
			'Lecture': 0,
			'Insolite': 0,
			'Evasion': 0,
			'Shopping': 0,
			'Divers': 0
		};
		//RESULTS KEPT: In order to have the right order of the results kept
		//Current code will NOT WORK server side. See if mrt:client-call package can help...

/*		if (resultsKeptSessionVar){
			var array = resultsKeptSessionVar;
			resultsKept = array.sort(function(a,b){return ((a.startTime).getTime() - (b.startTime).getTime());});
			resultsKeptIndex = 0;
		}
*/
		var security = 0;
		benchmarkStart = new Date();

		// ************** BEGINNING OF LOOP ************** //

		while (resultsLength < dayLength){ 

			security += 1;
			if (security === 10000){
				console.log('Security break:' + security + ' attempts');
				break;
			}

			//To work with areas: defines new district IF ALL ACTIVITIES in required district have been tried
			if ((typeof district !== 'undefined') && (trackDocsIndex.length >= nbActivitiesArray[0])){
					var randomDistrictIndex = Math.floor((Math.random()) * (areaSize - 1) + 1);
					district = area[randomDistrictIndex];
					nbActivities = nbActivitiesArray[randomDistrictIndex];
					//Other solution with array of all Indexes			
/*					var randomDistrictIndex = Math.floor((Math.random()) * allOtherIndexesOfArea.length);
					random = allOtherIndexesOfArea[randomDistrictIndex];
*/					//Converted to string to look through indexes after that
					if (district < 10)
						district = '0' + district;	
			}
			//End of code for areas

			/* To select random documents, see the following links:
			http://bdadam.com/blog/finding-a-random-document-in-mongodb.html
			http://stackoverflow.com/questions/20336361/get-random-document-from-a-meteor-collection
			http://stackoverflow.com/questions/2824157/random-record-from-mongodb
			http://stackoverflow.com/questions/13524641/how-to-get-random-single-document-from-1-billion-documents-in-mongodb-using-pyth

			Method with a 'rand' field in each doc (rand = Math.random()) and then a search with {rand:{$gt:r}, with r = Math.random() could be a good solution
			*/
			random = Math.floor((Math.random() * nbActivities) + 1);
			//If district is taken into account
			if (typeof district !== 'undefined'){
				random = random.toString() + district.toString();
				random = parseInt(random);
			}
			//
			doc = Activities.findOne({index: random});
			if (trackDocsIndex.indexOf(doc.index) === -1)
				trackDocsIndex.push(doc.index);

			//IF SOME RESULTS HAVE BEEN KEPT
/*			if((typeof resultsKept !== 'undefined') && (resultsKeptIndex < resultsKept.length)){

				resultKept = resultsKept[resultsKeptIndex];
				startTime = new Date(resultKept.startTime);

				//If it starts at the same moment ('=') than a kept activity, skips the time slot
				//There is also the '>', in case the first activity is kept at 11:59 and roulette is rerun at 12:00 for instance
				if (start.getTime() >= startTime.getTime()){

					rouletteResults.push(resultKept);
					trackResultsId.push(resultKept._id); 
					trackTypes.push({
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

			day = weekday[start.getDay()];

			//Test: if activity is open this day (i.e if day exists in document)
			while ((typeof doc[day] === 'undefined')){
				random = Math.floor((Math.random() * nbActivities) + 1);
				//If district is taken into account
				if (typeof district !== 'undefined'){
					random = random.toString() + district.toString();
					random = parseInt(random);
				}
				doc = Activities.findOne({index: random});
				if (trackDocsIndex.indexOf(doc.index) === -1)
					trackDocsIndex.push(doc.index);
			}

			//Test: if all documents have been tested without success, break the loop
			if (trackDocsIndex.length === nbActivitiesTotal && lastDoc)
				break;
			if (trackDocsIndex.length === nbActivitiesTotal)
				lastDoc = true;

			//Test: Activity has not already been suggested
			if (trackResultsId.indexOf(doc._id) > -1)
				continue;

			//Test: For REDUNDANT types of activities: check if one similar has not been offered too recently (ie below 'gap' variable time)
			var redundantIndex = -1;
			for (k=0; k < trackTypes.length; k++){
				if((trackTypes[trackTypes.length - 1 - k]).type === doc.type){
					redundantIndex = trackTypes.length - 1 - k;
					break;
				}
			}
			if (redundantIndex > -1){
				var difference = start.getTime() - ((trackTypes[redundantIndex]).time).getTime();
				if (difference < gap*unit*60000 && (countRedundantTypes[doc.type] < luck)){
					countRedundantTypes[doc.type] += 1;
					continue;
				}
			}

			//Test: For Restaurants
			hour = start.getHours();
			//Will absolutely require a Restaurant if it is eating time and he has not already eaten (or eaten more than 'gap' ago)
			if ((eatingHours.indexOf(hour) > -1) && (doc.type !== 'Restaurant')){ //If it's time to eat, let's check if the user has eaten
				var restaurantIndex = -1;
				for (k=0; k < trackTypes.length; k++){
					if(trackTypes[k].type === 'Restaurant')
						restaurantIndex = k;
				}
				if ((restaurantIndex > -1) && ((start.getTime() - ((trackTypes[restaurantIndex]).time).getTime()) >= gap*unit*60000))
					continue;
				if (restaurantIndex === -1)
					continue;
			}
			//Will absolutely exclude restaurant if it is NOT eating time
			else if ((eatingHours.indexOf(hour)) === -1 && (doc.type === 'Restaurant'))
				continue;

			//Test: If activity is open during the time slot considered
			var docday = doc[day];
			var check2 = false;
			startTest = new Date(start); //Important to create a NEW Date Object

			for (k=0; k < docday.length; k++){

				var openingHours = docday[k].split("-");

				if (openingHours.length === 2){ //Check if there is an open AND a close hour

					openTime = openingHours[0];
					openHours = openTime.substr(0,2);
					openMinutes = openTime.substr(2,2);
					open = new Date(startTest.setHours(openHours,openMinutes,0,0));

					closeTime = openingHours[1];
					closeHours = closeTime.substr(0,2);
					closeMinutes = closeTime.substr(2,2);
					close = new Date(startTest.setHours(closeHours,closeMinutes,0,0));
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
					open = new Date(startTest.setHours(openHours, openMinutes, 0));

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
			
			//Resets variables to monitor probability of events to appear - (can be placed right after Redundant place or right after the last test (at the end of the loop), with different effect on probability)
			for (var type in countRedundantTypes) {
				countRedundantTypes[type] = 0;
			}

			//Resets tracking of doc that have already been tested
			trackDocsIndex = [];

			//Creates end Date object, and Start and End strings
			if (check3 || check4){
				startString = timeString(start);
				end = new Date(start.getTime() + unit*60000*doc.last); //We add time to the timestamp
				endString = timeString(end);

				rouletteResults.push(createActivityObject(doc));
				trackResultsId.push(doc._id);
				trackTypes.push({
					type: doc.type,
					time: start
				});
				resultsLength += doc.last;
			}

			if (check3){  //If the randomly chosen activity is open at start
				start = new Date(end);
				continue;
			}

			if (check4) {
				//Skips the time slot of the activity that was kept
				rouletteResults.push(resultKept); 
				start = new Date(end.getTime() + unit*60000*resultKept.last); 
				resultsLength += resultKept.last;
				resultsKeptIndex += 1;
			}
		}
		benchmarkEnd = new Date();
		benchmark = benchmarkEnd.getTime() - benchmarkStart.getTime();
		return {rouletteResults: rouletteResults, 
				benchmark: benchmark, 
				security: security
				};
	}
});

