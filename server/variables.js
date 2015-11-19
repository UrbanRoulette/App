Meteor.startup(function(){
	activity_types = ['walk',  
					'bar', //Gmap
					'night_club', //Gmap
					'movie_theater', //Gmap
					'concert',
					'cooking', 
					'discovery',
					'miscellaneous',
					'escape',
					'event',
					'random',
					'game',
					'reading',
					'museum', //Gmap
					'music',
					'breakfast or snack', 
					'rest',
					'restaurant', //Gmap
					'shopping',
					'sport',
					'theater',
					'visit'
					];

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

	districts = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
	profiles = ["gratuit", "cheap", "exterieur", "curieux", "couple", "solo", "potes", "prestige"];
	district_coordinates = {
		0: {"lat":48.8640493,"lng":2.331052600000021},
		1: {"lat":48.8640493,"lng":2.331052600000021},
		2: {"lat":48.8675641,"lng":2.3439899999999625},
		3: {"lat":48.8634799,"lng":2.3591145000000324},
		4: {"lat":48.8534275,"lng":2.3582787999999937},
		5: {"lat":48.8434912,"lng":2.351833899999974},
		6: {"lat":48.8488576,"lng":2.3354223000000047},
		7: {"lat":48.85433450000001,"lng":2.3134029000000282},
		8: {"lat":48.8718722,"lng":2.3176432000000204},
		9: {"lat":48.8790183,"lng":2.337906299999986},
		10: {"lat":48.8785618,"lng":2.360368900000026},
		11: {"lat":48.85799300000001,"lng":2.3811530000000403},
		12: {"lat":48.8293647,"lng":2.426540599999953},
		13: {"lat":48.830759,"lng":2.359203999999977},
		14: {"lat":48.8314408,"lng":2.3255684000000656},
		15: {"lat":48.8421616,"lng":2.2927664999999706},
		16: {"lat":48.8585799,"lng":2.284701700000028},
		17: {"lat":48.891986,"lng":2.319287000000031},
		18: {"lat":48.891305,"lng":2.352986699999974},
		19: {"lat":48.88237609999999,"lng":2.382291699999996},
		20: {"lat":48.8599825,"lng":2.4066411999999673}
	};
});
