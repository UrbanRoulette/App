/*
//Parameters
pace = 30; // Pace (in number of minutes) (must divide 60)
unit = 30; //Unit for the last of each activity in database (in number of minutes)
dayLength = 16; //Length of day (in number of unit). Ex: If unit=30 (ie half-hour), then dayLength = 2 means 1 hour
gap = 12; //Gap between two activities (in number of unit). During this gap, activity of the same category will not be offered, unless it has been randomly chosen more than var 'luck' times 
luck = 3; //Number of tries from which an activity can appear even if it is redundant

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
eatingHours = $.merge(lunchHours,dinnerHours);

//Functions
roundTime = function(date, pace){  
	var h = date.getHours();
	var m = date.getMinutes();
	var result = m/unit;
	var quotient = Math.floor(result);
	if((quotient + 1) === 60/pace)
		date.setHours(h+1,0,0,0); //Important to set seconds and milliseconds to 0!
	else 
		date.setHours(h,(quotient+1)*pace,0,0);
	return date;
};

createActivityObject = function(doc){
	var activity = {
	name: doc.name,
	address: doc.address,
	specific: doc.specific,
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

algorithm = function(){

	nbActivities = Activities.find().count();

	var date = new Date();
	start = roundTime(date, pace);

	var rouletteResults = [];
	var resultsLength = 0;
	var trackIndex = [];
	var trackTypes = [];

	//Variables to monitor probability of events to appear
	var countRedundantTypes = {
		'Restaurant': 0,
		'Bar': 0,
		'Cinéma': 0,
		'Sport': 0,
		'Boite':0,
		'Théâtre': 0,
		'Musée': 0,
		'Balade': 0,
		'Jeux': 0,
		'Musique': 0,
		'Lecture': 0,
		'Insolite': 0,
		'Evasion': 0
	};

	//RESULTS KEPT: In order to have the right order of the results kept
	if (Session.get('resultsKept')){
		var array = Session.get('resultsKept');
		resultsKept = array.sort(function(a,b){return ((a.startTime).getTime() - (b.startTime).getTime());});
		resultsKeptIndex = 0;
	}

	//BEGINNING OF LOOP

	var security = 0;
	benchmarkStart = new Date();

	while (resultsLength < dayLength){ 

		security += 1;
		if (security === 10000){
			console.log('Security break:' + security + ' attempts');
			break;
		}

		// To select random documents, see the following links:
		//http://bdadam.com/blog/finding-a-random-document-in-mongodb.html
		//http://stackoverflow.com/questions/20336361/get-random-document-from-a-meteor-collection
		//http://stackoverflow.com/questions/2824157/random-record-from-mongodb
		//http://stackoverflow.com/questions/13524641/how-to-get-random-single-document-from-1-billion-documents-in-mongodb-using-pyth

		//Method with a 'rand' field in each doc (rand = Math.random()) and then a search with {rand:{$gt:r}, with r = Math.random() could be a good solution

		random = Math.floor((Math.random() * nbActivities) + 1);
		doc = Activities.findOne({index: random});

		if((typeof resultsKept !== 'undefined') && (resultsKeptIndex < resultsKept.length)){

			resultKept = resultsKept[resultsKeptIndex];
			startTime = new Date(resultKept.startTime);

			//If it starts at the same moment ('=') than a kept activity, skips the time slot
			//There is also the '>', in case the first activity is kept at 11:59 and roulette is rerun at 12:00 for instance
			if (start.getTime() >= startTime.getTime()){

				rouletteResults.push(resultKept);
				trackIndex.push(resultKept.index); 
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
			check3 = true;

		day = weekday[start.getDay()];

		//Test: if activity is open this day (i.e if day exists in document)
		while ((typeof doc[day] === 'undefined')){
			random = Math.floor((Math.random() * nbActivities) + 1);
			doc = Activities.findOne({index: random});
		}

		//Test: Activity has not already been suggested
		if (trackIndex.indexOf(doc.index) > -1)
			continue;

		//Test: For REDUNDANT types of activities: check if one similar has not been offered to recently (ie below 'gap' variable time)
		var redundantIndex = -1;
		for (k=0; k < trackTypes.length; k++){
			if(trackTypes[trackTypes.length - 1 - k].type === doc.type){
				redundantIndex = k;
				break;
			}
		}
		if ((redundantIndex > -1) && ((start.getTime() - (trackTypes[redundantIndex].time).getTime()) < gap*unit*60000) && (countRedundantTypes[doc.type] < luck)){
			countRedundantTypes[doc.type] += 1;
			continue;
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
			if ((restaurantIndex > -1) && (start.getTime() - (trackTypes[restaurantIndex].time).getTime()) >= gap*unit*60000)
				continue;
			if (restaurantIndex === -1)
				continue;
		}
		//Will absolutely exclude restaurant if it is NOT eating time
//		else if ((eatingHours.indexOf(hour)) === -1 && (doc.type === 'Restaurant'))
//			continue;

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

		//Resets variables to monitor probability of events to appear - (can be placed right after Redundant place or right after the last test (at the end of the loop), with different effect on probability)
		for (var type in countRedundantTypes) {
			countRedundantTypes[type] = 0;
		}


		//Creates end Date object, and Start and End strings
		if (check3 || check4){
			startString = timeString(start);
			end = new Date(start.getTime() + unit*60000*doc.last); //We add time to the timestamp
			endString = timeString(end);

			rouletteResults.push(createActivityObject(doc));
			trackIndex.push(doc.index);
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
//			continue;
		}
	}
	benchmarkEnd = new Date();
	benchmark = benchmarkEnd.getTime() - benchmarkStart.getTime();
	console.log(benchmark + ' ms');
	console.log(security + ' iterations');
	Session.set('rouletteResults', rouletteResults);
};
*/