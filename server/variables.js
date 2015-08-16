Meteor.startup(function(){

	//Variables
	weekday = new Array(7);
	weekday[0]=  "sunday";
	weekday[1] = "monday";
	weekday[2] = "tuesday";
	weekday[3] = "wednesday";
	weekday[4] = "thursday";
	weekday[5] = "friday";
	weekday[6] = "saturday";

	jours_semaine = new Array(7);
	jours_semaine[0]=  "dimanche";
	jours_semaine[1] = "lundi";
	jours_semaine[2] = "mardi";
	jours_semaine[3] = "mercredi";
	jours_semaine[4] = "jeudi";
	jours_semaine[5] = "vendredi";
	jours_semaine[6] = "samedi";

	day_moment = ["matin","aprem","soir"];
	day_moment_hours = [8,14,20];

	lunchHours = [12,13];
	dinnerHours = [19,20];
	eatingHours = lunchHours.concat(dinnerHours);

	districts = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,77,78,91,92,93,94,95,99];//All districts

	areas = [
			[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,99], //Paris (all districts)
			[1,2,3,4,5,6,7,8,9,99],
			[2,1,4,8,9,10,11,99],
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
			[77],
			[78],
			[91],
			[92],
			[93],
			[94],
			[95],
			[99]
			];

	nbActivities_perDistrict = {};		

	types = ['Balade', //0
				'Bar',
				'Boite',
				'Cinéma/Film',
				'Concert',
				'Cuisine', //5
				'Découverte',
				'Divers',
				'Evasion',
				'Evènement',
				'Insolite', //10
				'Jeux',
				'Lecture',
				'Musée',
				'Musique',
				'Petit-dej ou goûter', //15
				'Repos',
				'Restaurant',
				'Shopping',
				'Sport',
				'Théâtre', //20
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
});