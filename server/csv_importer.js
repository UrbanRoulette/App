/*
//DO NOT FORGET TO:
// 1- Right proper file name
// 2- Remove empty lines in CSV file

Meteor.startup(function(){
// !!!!!!!!!!!!  ATTENTION  !!!!!!!!!!!!! //	
//	Activitieswaiting.remove({});
// !!!!!!!!!!!!  ATTENTION  !!!!!!!!!!!!! //

	csvAsString = Assets.getText('csvfiles/Ou Bruncher - final.csv');
	csvparsed = Baby.parse(csvAsString, {
					header: true,
					skipEmptyLines: true
					});
	array = csvparsed.data;

	for(i=0; i < array.length; i++){
		doc = array[i];
		
		str = doc.price;
		var price = str.slice(0, -1);

		if(doc.contact !== '')
			contact = '0' + doc.contact;
		else
			contact = null;

		var name = (doc.name).slice(7);

		if((price).slice(-2) === '00')
			price = price.slice(0,2);
		else
			price = price.slice(0,4);

		activitywaiting = {
			specific: doc.specific,
			name: name,
			type: 'Petit-dej ou goûter',
			address: doc.address,
			description: doc.description,
			price: price,
			hours: doc.hours,
			link: doc.link,
			mark: '5',
			contact: contact,
			image: doc.image,
			source: 'OuBruncher.com',
			submitted: (new Date()).getTime()
		};
		Activitieswaiting.insert(activitywaiting);
	}

	var csvAsString = Assets.getText('csvfiles/Bars - Timeout - Happy Hours - final.csv');
	var csvparsed = Baby.parse(csvAsString, {
					header: true,
					skipEmptyLines: true
					});

	var array = csvparsed.data;

	for(i=0; i < array.length; i++){

		doc = array[i];
		str = (doc.metrostation).slice(8);
		
		if (str.indexOf(', ') > -1 && str.indexOf(' ou ') > -1){
			a = str.split(', ');
			c = [a[0]];
			b = a[1].split(' ou ');
			metrostation = c.concat(b);
		}

		else {
			metrostation = str.split(' ou ');
		}

		var activitypartial = {
			specific: 'Prendre un verre en Happy Hour',
			name: doc.name,
			type: 'Bar',
			address: doc.address,
			metrostation: metrostation,
			description: doc.description,
			price: doc.price,
			hours: doc.hours,
			link: doc.link,
			mark: '5',
			contact: doc.contact,
			image: doc.image,
			source: 'TimeOut',
			submitted: (new Date()).getTime()
		};
		Activitieswaiting.insert(activitypartial);
	}

});
*/

