Meteor.startup(function(){
	classes = [
		'Activity',
		'Discovery',
		'Random',
		'Recommendation'
	];

	categories = {
		"Arts & Entertainment": {'movie_theater': {}, 'concert': {}},
		"College & University": {},
		"Event": {},
		"Food": {},
		"Nightlife Spot": {'bar': {}, 'night_club': {} },
		"Outdoors & Recreation": {'stroll': {}, 'escape': {}},
		"Professional & Other Places": {},
		"Residence": {"indoor_game": {}},
		"Shop & Service": {"unusual": {}},
		"Travel and Transport": {}
	};

		var activities = [ 
					
					'cooking', 
					'miscellaneous',
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

});
