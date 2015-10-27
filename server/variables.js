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
});