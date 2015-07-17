AutoForm.hooks({    
    submitActivity: {
      before: {
        insert: function(doc) {
        	if(typeof form !== 'undefined')
        		Activitieswaiting.remove({_id: form._id});
        	$("#hours").addClass('hidden');
			doc.exactPrice = $('#exactPrice-radio').prop('checked');
			doc.submitted = new Date();
		//	if()
			doc.index = Activities.find().count() + 1;
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
*/$(".list-group-item").css({'display': 'table-cell', 'padding':'0 0 0 20px', 'border': 'none'});
// $(".autoform-add-item").trigger('click');
});

Template.formDatabase.events({
	'click #add-activity-waiting': function(e){
		form = Activitieswaiting.findOne({}, {sort: {submitted: 1}});
		$("[name='specific']").val(form.specific);
		$("[name='name']").val(form.name);
		$("[name='type']").val(form.type);
		$("[name='address']").val(form.address);
		$("[name='description']").code(form.description);
		$("[name='price']").val(form.price);
		$("[name='last']").val(form.last);
		$("#hours").removeClass('hidden');
		$("#hours").val(form.hours);
		$("[name='link']").val(form.link);	
		$("[name='contact']").val(form.contact);
		$("[name='image']").val(form.image);
	},

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
			$("#hours").addClass('hidden');
		}
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
	'click #balade': function(e){
		$("[name='type']").val('Balade');
	},
	'click #jeux': function(e){
		$("[name='type']").val('Jeux');
	},
	'click #musique': function(e){
		$("[name='type']").val('Musique');
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