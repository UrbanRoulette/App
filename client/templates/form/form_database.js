AutoForm.hooks({    
    submitActivity: {
      before: {
        insert: function(doc) {
        	if(typeof form !== 'undefined'){
        		Activitieswaiting.remove({_id: form._id});
        		if (typeof form.metrostation !== 'undefined')
        			doc.metrostation = form.metrostation;
        	}
        	var last = ($("#last").val()).split('h');
        	for (k=0; k < last.length; k++){
        		last[k] = parseInt(last[k]);
        	}
        	doc.last = last[0]*60 + last[1];
        	$("#hours").addClass('hidden');
//        	doc.description = doc.description.css({"font-family":"\"Helvetica Neue\", Helvetica, Arial, sans-serif;"});	
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

			doc.submitted = new Date();
			doc.requiresun = $('#sun-checkbox').prop('checked');
			doc.index = 0;
			this.result(doc);
        }
      } 
    }     
  });

Template.formDatabase.onRendered(function(){
	$('#summernote').summernote();
	/*  toolbar: [
	    //[groupname, [button list]]
	     
	    ['style', ['bold', 'italic', 'underline', 'clear']],
	    ['font', ['strikethrough', 'superscript', 'subscript']],
	    ['fontsize', ['fontsize']],
	    ['color', ['color']],
	    ['para', ['ul', 'ol', 'paragraph']],
	    ['height', ['height']],
	  ]
		});
	*/
	$(".list-group-item").css({'display': 'table-cell', 'padding':'0 0 0 20px', 'border': 'none'});
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth();
	$("#start-year").val(year);
	$("#end-year").val(year);
	// $(".autoform-add-item").trigger('click');
});

Template.formDatabase.events({
	'click #add-activity-waiting': function(e){
		form = Activitieswaiting.findOne({}, {sort: {submitted: 1}});
		$("[name='specific']").val(form.specific);
		$("[name='name']").val(form.name);
		$("[name='type']").val(form.type);
		$("[name='address']").val(form.address);
		if(typeof form.metrostration !== 'undefined')
			$("[name='metrostation.0']").val((form.metrostation)[0]);
		$("[name='description']").code(form.description);
		$("[name='price']").val(form.price);
		$("[name='last']").val(form.last);
		$("#hours").removeClass('hidden');
		$("#hours").val(form.hours);
		$("[name='link']").val(form.link);	
		$("[name='contact']").val(form.contact);
		$("[name='image']").val(form.image);
		$("[name='source']").val(form.source);
		//For Happy Hours imported from TimeOut
/*		if(form.specific === 'Prendre un verre en Happy Hour')
			$("#metrostation").addClass('hidden');			
*/	},

	'click #remove-activity-waiting': function(e){
		if (confirm("Etes-vous sûr de vouloir supprimer l'activité \"" + form.name + "\" ? (si pas de nom, l'attribut \"name\" n'existe pas)")) {
			Activitieswaiting.remove({_id: form._id});
			$("[name='specific']").val(null);
			$("[name='name']").val(null);
			$("[name='type']").val(null);
			$("[name='address']").val(null);
			$("[name='description']").val(null);
			$("[name='price']").val(null);
			$("[name='last']").val(null);
			$("#hours").val(null);
			$("[name='link']").val(null);	
			$("[name='contact']").val(null);
			$("[name='image']").val(null);
			$("[name='source']").val(null);
			$("#hours").addClass('hidden');
		}
	},

	'click #skip-activity-waiting': function(e){	
		Activitieswaiting.update({_id: form._id}, {$set: {submitted: new Date()}});
		$("[name='specific']").val(null);
		$("[name='name']").val(null);
		$("[name='type']").val(null);
		$("[name='address']").val(null);
		$("[name='description']").val(null);
		$("[name='price']").val(null);
		$("[name='last']").val(null);
		$("#hours").val(null);
		$("[name='link']").val(null);	
		$("[name='contact']").val(null);
		$("[name='image']").val(null);
		$("[name='source']").val(null);
		$("#hours").addClass('hidden');
	},

	'change #temporary-checkbox': function(e) {
		$("#temporary-options").toggleClass("hidden");
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
		$("[name='type']").val('Cinéma');
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