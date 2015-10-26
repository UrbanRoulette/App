AutoForm.hooks({    
    submitActivity: {
      before: {
        method: function(doc) {
//         	this.event.preventDefault();
        	if(typeof form !== 'undefined')//{
        		Activitieswaiting.remove({_id: form._id});
/*        		if (typeof form.metrostation !== 'undefined')
        			doc.metrostation = form.metrostation;
        	}
*/			
			doc.requiresun = $('#sun-checkbox').prop('checked');
			doc.requirebooking = false;
			var string_address = $('input[name="location"]').val();
			var last = ($("#last").val()).split('h');
        	doc.last = parseInt(last[0])*60 + parseInt(last[1]);
        	$("#hours").addClass('hidden');

        	var geocoder = new google.maps.Geocoder();	
			geocoder.geocode({'address': string_address}, function(results, status) {
			    if (status === google.maps.GeocoderStatus.OK) {
			        var place = results[0];

			        //PlaceId
			        doc.placeId = place.place_id;

			        //Get GeoJSON object
			        var lat = place.geometry.location.lat();
			        var lng = place.geometry.location.lng();
			        var GeoJSON = { "type": "Point", "coordinates": [lng, lat]};
			        doc.index = GeoJSON;
			    
			        // Complete Address
			        var componentForm = {
					  street_number: 'short_name',
					  route: 'long_name',
					  locality: 'long_name',
					  administrative_area_level_1: 'short_name',
					  country: 'long_name',
					  postal_code: 'short_name'
					};
					for (var i = 0; i < place.address_components.length; i++) {
						var addressType = place.address_components[i].types[0];
						if (componentForm[addressType]) {
						  var val = place.address_components[i][componentForm[addressType]];
						  componentForm[addressType] = val;
						}
					}
					componentForm.formatted_address = place.formatted_address;
					doc.address = componentForm;

		//			doc.openinghours = ;
			    }
			    else {
			      console.log('Geocode was not successful for the following reason: ' + status);
			    }
			});          	
			doc.temporary = $('#temporary-checkbox').prop('checked');
			if($('#temporary-checkbox').prop('checked')){
				var startYear = $("#start-year").val();
				var startMonth = $("#start-month").val() - 1;
				var startDay = $("#start-day").val();
				doc.startdate = new Date(startYear, startMonth, startDay);	
				var endYear = $("#end-year").val();
				var endMonth = $("#end-month").val() - 1;
				var endDay = $("#end-day").val();
				doc.enddate = new Date(endYear, endMonth, endDay,23,59,59,999);	
				doc.yearperiodic = $('#year-periodic-radio').prop('checked');
			}
			tempCheckbox.set(false);
			doc.draws = 0;
			doc.rand = Math.random();
			return doc;
		}
      } 
    }     
  });

Template.formDatabase.onCreated(function(){
	tempCheckbox = new ReactiveVar(false);
});

Template.formDatabase.onRendered(function(){
	$(".list-group-item").css({'display': 'table-cell', 'padding':'0 0 0 20px', 'border': 'none'});
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth();
	$("#start-year").val(year);
	$("#end-year").val(year);
	
});

Template.formDatabase.helpers({
	temporaryHelper: function(){
		if(tempCheckbox.get())
			return 'visible';
		else
			return 'hidden';
	}
});

Template.formDatabase.events({
	'change #temporary-checkbox': function(e) {
		tempCheckbox.set($('#temporary-checkbox').prop('checked'));
	},

	'blur #defaultValue0': function(e) {
	var value = $('#defaultValue0').val();
	if($('#weekdays0').prop('checked')) {
		$("[name='monday.0']").val(value);
		$("[name='tuesday.0']").val(value);
		$("[name='wednesday.0']").val(value);
		$("[name='thursday.0']").val(value);
		$("[name='friday.0']").val(value);
	}
	if ($('#weekdays0').prop('checked')){
		$("[name='saturday.0']").val(value);
		$("[name='sunday.0']").val(value);
	}
	},

	'change #weekdays0': function(e) {
		var value = $('#defaultValue0').val();
		if($('#weekdays0').prop('checked')) {
		$("[name='monday.0']").val(value);
		$("[name='tuesday.0']").val(value);
		$("[name='wednesday.0']").val(value);
		$("[name='thursday.0']").val(value);
		$("[name='friday.0']").val(value);			
		}
		else {
		$("[name='monday.0']").val(null);
		$("[name='tuesday.0']").val(null);
		$("[name='wednesday.0']").val(null);
		$("[name='thursday.0']").val(null);
		$("[name='friday.0']").val(null);
		}
	},

	'change #weekend0': function(e) {
		var value = $('#defaultValue0').val();
		if($('#weekend0').prop('checked')) {
		$("[name='saturday.0']").val(value);
		$("[name='sunday.0']").val(value);		
		}
		else {
		$("[name='saturday.0']").val(null);
		$("[name='sunday.0']").val(null);
		}
	},
	'blur #defaultValue1': function(e) {
	var value = $('#defaultValue1').val();
	if($('#weekdays1').prop('checked')) {
		$("[name='monday.1']").val(value);
		$("[name='tuesday.1']").val(value);
		$("[name='wednesday.1']").val(value);
		$("[name='thursday.1']").val(value);
		$("[name='friday.1']").val(value);
	}
	if ($('#weekdays0').prop('checked')){
		$("[name='saturday.1']").val(value);
		$("[name='sunday.1']").val(value);
	}
	},

	'change #weekdays1': function(e) {
		var value = $('#defaultValue1').val();
		if($('#weekdays1').prop('checked')) {
		$("[name='monday.1']").val(value);
		$("[name='tuesday.1']").val(value);
		$("[name='wednesday.1']").val(value);
		$("[name='thursday.1']").val(value);
		$("[name='friday.1']").val(value);			
		}
		else {
		$("[name='monday.1']").val(null);
		$("[name='tuesday.1']").val(null);
		$("[name='wednesday.1']").val(null);
		$("[name='thursday.1']").val(null);
		$("[name='friday.1']").val(null);
		}
	},

	'change #weekend1': function(e) {
		var value = $('#defaultValue1').val();
		if($('#weekend1').prop('checked')) {
		$("[name='saturday.1']").val(value);
		$("[name='sunday.1']").val(value);		
		}
		else {
		$("[name='saturday.1']").val(null);
		$("[name='sunday.1']").val(null);
		}
	},
	'click #add-all-button': function(e) {
/*		if($("[name='monday.1']").get(0))
			$(".autoform-remove-item").trigger('click');
		else
*/			$(".autoform-add-item").trigger('click');
	},

	'click .autoform-add-item': function(e) {
		$('#days1').css('display', 'inline-block');
	},
	'click .autoform-remove-item': function(e) {
//		if($("[name='monday.1']").get(0) || $("[name='tuesday.1']").get(0) || $("[name='wednesday.1']").get(0) || $("[name='thursday.1']").get(0) || $("[name='friday.1']").get(0) || $("[name='saturday.1']").get(0) || $("[name='sunday.1']").get(0))
			$('#days1').css('display', 'none');
	},
	'click #restaurant': function(e){
		$("[name='type']").val('Restaurant');
	},
	'click #petit-dej-ou-gouter': function(e){
		$("[name='type']").val('Petit-dej ou goûter');
	},
	'click #bar': function(e){
		$("[name='type']").val('Bar');
	},
	'click #cinema': function(e){
		$("[name='type']").val('Cinéma/Film');
	},
	'click #sport': function(e){
		$("[name='type']").val('Sport');
	},
	'click #boite': function(e){
		$("[name='type']").val('Boite');
	},
	'click #theatre': function(e){
		$("[name='type']").val('Théâtre');
	},
	'click #musee': function(e){
		$("[name='type']").val('Musée');
	},
	'click #visite': function(e){
		$("[name='type']").val('Visite');
	},
	'click #balade': function(e){
		$("[name='type']").val('Balade');
	},
	'click #jeux': function(e){
		$("[name='type']").val('Jeux');
	},
	'click #concert': function(e){
		$("[name='type']").val('Concert');
	},
	'click #evenement': function(e){
		$("[name='type']").val('Evènement');
	},
	'click #lecture': function(e){
		$("[name='type']").val('Lecture');
	},
	'click #insolite': function(e){
		$("[name='type']").val('Insolite');
	},
	'click #evasion': function(e){
		$("[name='type']").val('Evasion');
	},
	'click #shopping': function(e){
		$("[name='type']").val('Shopping');
	},
	'click #cuisine': function(e){
		$("[name='type']").val('Cuisine');
	},
	'click #decouverte': function(e){
		$("[name='type']").val('Découverte');
	},
	'click #repos': function(e){
		$("[name='type']").val('Repos');
	},
	'click #divers': function(e){
		$("[name='type']").val('Divers');
	},
	'click #lieux-curieux': function(e){
		$("[name='source']").val('300 lieux pour les curieux');
	},
	'click #timeout': function(e){
		$("[name='source']").val('TimeOut');
	},
	'click #parisbouge': function(e){
		$("[name='source']").val('ParisBouge');
	},
	'click #petitestables': function(e){
		$("[name='source']").val('Les Petites Tables');
	},
	'click #bars-restos-insolites': function(e){
		$("[name='source']").val('Paris - Bars & Restos insolites');
	},
	'click #le-branche': function(e){
		$("[name='source']").val('Le Branché');
	},
	'click #topito': function(e){
		$("[name='source']").val('Topito');
	},
	'click #paris-zigzag': function(e){
		$("[name='source']").val('Paris ZigZag');
	},
/*	'blur #specific': function(e) {
		specific = JSON.stringify($("[name='specific']").val());
	},
	'click #reinsert-values': function(e){
		$("[name='specific']").val(specific);
	},
*/

/*	'click #submit-button': function(e) {
		e.preventDefault();
//		if(confirm())
	}
*/
});
