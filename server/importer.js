/*
//DO NOT FORGET TO:
// 1- Right proper file name
// 2- Remove empty lines in CSV file

Meteor.startup(function(){	
//	Activitieswaiting.remove({});
	var csvAsString = Assets.getText('csvfiles/XXXX.csv');
	var csvparsed = Baby.parse(csvAsString, {
					header: true,
					skipEmptyLines: true
					});
	var array = csvparsed.data;

	for(i=0; i < array.length; i++){
		var doc = array[i];
		var activitypartial = {
			specific: doc.specific,
			name: doc.name,
			type: doc.type,
			address: doc.address,
			description: doc.description,
			price: doc.price,
			last: doc.last,
			hours: doc.hours,
			link: doc.link,
			contact: doc.contact,
			image: doc.image,
			submitted: (new Date()).getTime()
		};
		Activitieswaiting.insert(activitypartial);
	}
});
*/

