Template.formDatabaseTableRow.events({
	'click .fa-times': function(e){
		if (confirm("Etes-vous sûr de vouloir supprimer cette activité ?")) {
			var number = parseInt((this.index).toString().slice(0,(this.index).toString().length - 4));
			Meteor.call('update_other_Indexes',this.district,this.type,number,function(error,result){
				if(error)
					console.log(error);
				else
					console.log('Other indexes updated succesfully');
			});
			Activities.remove({_id: this._id});
		}
	},

	'click .table-see-more-description': function(e){
		var docId = this._id;
		if ($('#' + docId + 'table-see-more-description').html() === "Voir plus..."){
			$('#' + docId +'description-cell-text').addClass('see-more-selected');
			$('#' + docId + 'table-see-more-description').html('Masquer');
		}
		else {
			$('#' + docId +'description-cell-text').removeClass('see-more-selected');
			$('#' + docId + 'table-see-more-description').html('Voir plus...');
		}
	},
	'click .table-see-more-hours': function(e){
		var docId = this._id;
		if ($('#' + docId + 'table-see-more-hours').html() === "Voir plus..."){
			$('#' + docId +'hours-cell-text').addClass('see-more-selected');
			$('#' + docId + 'table-see-more-hours').html('Masquer');
		}
		else {
			$('#' + docId +'hours-cell-text').removeClass('see-more-selected');
			$('#' + docId + 'table-see-more-hours').html('Voir plus...');
		}
	},

	'dblclick .copies-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.copies;
		var height = $('#' + docId + 'copies-cell-text').height();
		$('#' + docId + 'copies-cell-text').toggleClass('hidden');
		$('#' + docId + 'copies-cell-input').height(height);
		$('#' + docId + 'copies-cell-input').toggleClass('hidden');
		$('#' + docId + 'copies-cell-input').val(text);
		$('#' + docId + 'copies-cell-input').focus();
	},

	'blur .copies-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'copies-cell-input').val();
		Activities.update({_id: this._id}, {$set: {copies: Number(text)}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .specific-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.specific;
		var height = $('#' + docId + 'specific-cell-text').height();
		$('#' + docId + 'specific-cell-text').toggleClass('hidden');
		$('#' + docId + 'specific-cell-input').height(height);
		$('#' + docId + 'specific-cell-input').toggleClass('hidden');
		$('#' + docId + 'specific-cell-input').val(text);
		$('#' + docId + 'specific-cell-input').focus();
	},
	'blur .specific-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'specific-cell-input').val();
		Activities.update({_id: this._id}, {$set: {specific: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .name-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.name;
		var height = $('#' + docId + 'name-cell-text').height();
		$('#' + docId + 'name-cell-text').toggleClass('hidden');
		$('#' + docId + 'name-cell-input').height(height);
		$('#' + docId + 'name-cell-input').toggleClass('hidden');
		$('#' + docId + 'name-cell-input').val(text);
		$('#' + docId + 'name-cell-input').focus();
	},

	'blur .name-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'name-cell-input').val();
		Activities.update({_id: this._id}, {$set: {name: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .type-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.type;
		var number = parseInt((this.index).toString().slice(0,(this.index).toString().length - 4));
		var height = $('#' + docId + 'type-cell-text').height();
		$('#' + docId + 'type-cell-text').toggleClass('hidden');
		$('#' + docId + 'type-cell-input').height(height);
		$('#' + docId + 'type-cell-input').toggleClass('hidden');
		$('#' + docId + 'type-cell-input').val(text);
		$('#' + docId + 'type-cell-input').focus();
		Meteor.call('update_other_Indexes',this.district,text,number,function(error,result){
			if(error)
				console.log(error);
			else
				console.log('Other indexes updated succesfully');
		});

	},

	'blur .type-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'type-cell-input').val();
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		Meteor.call('updateIndex',docId,this.district,text,function(error,result){
			if(error)
				console.log(error);
			else
				console.log('Doc index updated succesfully');
		});
	},

	'dblclick .profile-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.profile;
		var height = $('#' + docId + 'profile-cell-text').height();
		$('#' + docId + 'profile-cell-text').toggleClass('hidden');
		$('#' + docId + 'profile-cell-input').height(height);
		$('#' + docId + 'profile-cell-input').toggleClass('hidden');
		$('#' + docId + 'profile-cell-input').val(text);
		$('#' + docId + 'profile-cell-input').focus();
	},

	'blur .profile-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'profile-cell-input').val();
		Activities.update({_id: this._id}, {$set: {profile: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},


	'dblclick .address-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.address;
		var height = $('#' + docId + 'address-cell-text').height();
		$('#' + docId + 'address-cell-text').toggleClass('hidden');
		$('#' + docId + 'address-cell-input').height(height);
		$('#' + docId + 'address-cell-input').toggleClass('hidden');
		$('#' + docId + 'address-cell-input').val(text);
		$('#' + docId + 'address-cell-input').focus();
	},

	'blur .address-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'address-cell-input').val();
		Activities.update({_id: this._id}, {$set: {address: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .metrostation-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.metrostation;
		var height = $('#' + docId + 'metrostation-cell-text').height();
		$('#' + docId + 'metrostation-cell-text').toggleClass('hidden');
		$('#' + docId + 'metrostation-cell-input').height(height);
		$('#' + docId + 'metrostation-cell-input').toggleClass('hidden');
		$('#' + docId + 'metrostation-cell-input').val(text);
		$('#' + docId + 'metrostation-cell-input').focus();
	},

	'blur .metrostation-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'metrostation-cell-input').val();
		var result = text.split(",");
		Activities.update({_id: this._id}, {$set: {metrostation: result}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .district-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.district;
		var number = parseInt((this.index).toString().slice(0,(this.index).toString().length - 4));
		var height = $('#' + docId + 'district-cell-text').height();
		$('#' + docId + 'district-cell-text').toggleClass('hidden');
		$('#' + docId + 'district-cell-input').height(height);
		$('#' + docId + 'district-cell-input').toggleClass('hidden');
		$('#' + docId + 'district-cell-input').val(text);
		$('#' + docId + 'district-cell-input').focus();
		Meteor.call('update_other_Indexes',parseInt(text),this.type,number,function(error,result){
			if(error)
				console.log(error);
			else
				console.log('Other indexes updated succesfully');
		});
	},

	'blur .district-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'district-cell-input').val();
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		Meteor.call('updateIndex',docId,parseInt(text),this.type,function(error,result){
			if(error)
				console.log(error);
			else
				console.log('Doc index updated succesfully');
		});
	},

	'dblclick .description-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.description;
		var height = $('#' + docId + 'description-cell-text').height();
		$('#' + docId + 'description-cell-text').toggleClass('hidden');
		$('#' + docId + 'description-cell-input').height(height);
		$('#' + docId + 'description-cell-input').toggleClass('hidden');
		$('#' + docId + 'description-cell-input').val(text);
		$('#' + docId + 'description-cell-input').focus();
	},

	'blur .description-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'description-cell-input').val();
		Activities.update({_id: this._id}, {$set: {description: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .price-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.price;
		var height = $('#' + docId + 'price-cell-text').height();
		$('#' + docId + 'price-cell-text').toggleClass('hidden');
		$('#' + docId + 'price-cell-input').height(height);
		$('#' + docId + 'price-cell-input').toggleClass('hidden');
		$('#' + docId + 'price-cell-input').val(text);
		$('#' + docId + 'price-cell-input').focus();
	},

	'blur .price-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'price-cell-input').val();
		Activities.update({_id: this._id}, {$set: {price: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .last-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.last;
		var height = $('#' + docId + 'last-cell-text').height();
		$('#' + docId + 'last-cell-text').toggleClass('hidden');
		$('#' + docId + 'last-cell-input').height(height);
		$('#' + docId + 'last-cell-input').toggleClass('hidden');
		$('#' + docId + 'last-cell-input').val(text);
		$('#' + docId + 'last-cell-input').focus();
	},

	'blur .last-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'last-cell-input').val();
		Activities.update({_id: this._id}, {$set: {last: Number(text)}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .requiresun-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.requiresun;
		var height = $('#' + docId + 'requiresun-cell-text').height();
		$('#' + docId + 'requiresun-cell-text').toggleClass('hidden');
		$('#' + docId + 'requiresun-cell-input').height(height);
		$('#' + docId + 'requiresun-cell-input').toggleClass('hidden');
		$('#' + docId + 'requiresun-cell-input').val(text);
		$('#' + docId + 'requiresun-cell-input').focus();
	},

	'blur .requiresun-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'requiresun-cell-input').val();
		var bool = true;
		if (text !== "true")
			bool = false;
		Activities.update({_id: this._id}, {$set: {requiresun: bool}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .contact-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.contact;
		var height = $('#' + docId + 'contact-cell-text').height();
		$('#' + docId + 'contact-cell-text').toggleClass('hidden');
		$('#' + docId + 'contact-cell-input').height(height);
		$('#' + docId + 'contact-cell-input').toggleClass('hidden');
		$('#' + docId + 'contact-cell-input').val(text);
		$('#' + docId + 'contact-cell-input').focus();
	},

	'blur .contact-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'contact-cell-input').val();
		Activities.update({_id: this._id}, {$set: {contact: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .source-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.source;
		var height = $('#' + docId + 'source-cell-text').height();
		$('#' + docId + 'source-cell-text').toggleClass('hidden');
		$('#' + docId + 'source-cell-input').height(height);
		$('#' + docId + 'source-cell-input').toggleClass('hidden');
		$('#' + docId + 'source-cell-input').val(text);
		$('#' + docId + 'source-cell-input').focus();
	},

	'blur .source-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'source-cell-input').val();
		Activities.update({_id: this._id}, {$set: {source: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .link-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.link;
		var height = $('#' + docId + 'link-cell-text').height();
		$('#' + docId + 'link-cell-text').toggleClass('hidden');
		$('#' + docId + 'link-cell-input').height(height);
		$('#' + docId + 'link-cell-input').toggleClass('hidden');
		$('#' + docId + 'link-cell-input').val(text);
		$('#' + docId + 'link-cell-input').focus();
	},

	'blur .link-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'link-cell-input').val();
		Activities.update({_id: this._id}, {$set: {link: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .mark-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.mark;
		var height = $('#' + docId + 'mark-cell-text').height();
		$('#' + docId + 'mark-cell-text').toggleClass('hidden');
		$('#' + docId + 'mark-cell-input').height(height);
		$('#' + docId + 'mark-cell-input').toggleClass('hidden');
		$('#' + docId + 'mark-cell-input').val(text);
		$('#' + docId + 'mark-cell-input').focus();
	},

	'blur .mark-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'mark-cell-input').val();
		Activities.update({_id: this._id}, {$set: {mark: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .monday-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.monday;
		var height = $('#' + docId + 'monday-cell-text').height();
		$('#' + docId + 'monday-cell-text').toggleClass('hidden');
		$('#' + docId + 'monday-cell-input').height(height);
		$('#' + docId + 'monday-cell-input').toggleClass('hidden');
		$('#' + docId + 'monday-cell-input').val(text);
		$('#' + docId + 'monday-cell-input').focus();
	},

	'blur .monday-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'monday-cell-input').val();
		var values = text.split(",");
		var result = [];
		for(i=0; i < values.length; i++){
			result.push(values[i].replace(/ /g,''));
		}
		Activities.update({_id: this._id}, {$set: {monday: result}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .tuesday-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.tuesday;
		var height = $('#' + docId + 'tuesday-cell-text').height();
		$('#' + docId + 'tuesday-cell-text').toggleClass('hidden');
		$('#' + docId + 'tuesday-cell-input').height(height);
		$('#' + docId + 'tuesday-cell-input').toggleClass('hidden');
		$('#' + docId + 'tuesday-cell-input').val(text);
		$('#' + docId + 'tuesday-cell-input').focus();
	},

	'blur .tuesday-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'tuesday-cell-input').val();
		var values = text.split(",");
		var result = [];
		for(i=0; i < values.length; i++){
			result.push(values[i].replace(/ /g,''));
		}
		Activities.update({_id: this._id}, {$set: {tuesday: result}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .wednesday-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.wednesday;
		var height = $('#' + docId + 'wednesday-cell-text').height();
		$('#' + docId + 'wednesday-cell-text').toggleClass('hidden');
		$('#' + docId + 'wednesday-cell-input').height(height);
		$('#' + docId + 'wednesday-cell-input').toggleClass('hidden');
		$('#' + docId + 'wednesday-cell-input').val(text);
		$('#' + docId + 'wednesday-cell-input').focus();
	},

	'blur .wednesday-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'wednesday-cell-input').val();
		var values = text.split(",");
		var result = [];
		for(i=0; i < values.length; i++){
			result.push(values[i].replace(/ /g,''));
		}
		Activities.update({_id: this._id}, {$set: {wednesday: result}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .thursday-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.thursday;
		var height = $('#' + docId + 'thursday-cell-text').height();
		$('#' + docId + 'thursday-cell-text').toggleClass('hidden');
		$('#' + docId + 'thursday-cell-input').height(height);
		$('#' + docId + 'thursday-cell-input').toggleClass('hidden');
		$('#' + docId + 'thursday-cell-input').val(text);
		$('#' + docId + 'thursday-cell-input').focus();
	},

	'blur .thursday-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'thursday-cell-input').val();
		var values = text.split(",");
		var result = [];
		for(i=0; i < values.length; i++){
			result.push(values[i].replace(/ /g,''));
		}
		Activities.update({_id: this._id}, {$set: {thursday: result}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .friday-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.friday;
		var height = $('#' + docId + 'friday-cell-text').height();
		$('#' + docId + 'friday-cell-text').toggleClass('hidden');
		$('#' + docId + 'friday-cell-input').height(height);
		$('#' + docId + 'friday-cell-input').toggleClass('hidden');
		$('#' + docId + 'friday-cell-input').val(text);
		$('#' + docId + 'friday-cell-input').focus();
	},

	'blur .friday-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'friday-cell-input').val();
		var values = text.split(",");
		var result = [];
		for(i=0; i < values.length; i++){
			result.push(values[i].replace(/ /g,''));
		}
		Activities.update({_id: this._id}, {$set: {friday: result}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .saturday-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.saturday;
		var height = $('#' + docId + 'saturday-cell-text').height();
		$('#' + docId + 'saturday-cell-text').toggleClass('hidden');
		$('#' + docId + 'saturday-cell-input').height(height);
		$('#' + docId + 'saturday-cell-input').toggleClass('hidden');
		$('#' + docId + 'saturday-cell-input').val(text);
		$('#' + docId + 'saturday-cell-input').focus();
	},

	'blur .saturday-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'saturday-cell-input').val();
		var values = text.split(",");
		var result = [];
		for(i=0; i < values.length; i++){
			result.push(values[i].replace(/ /g,''));
		}
		Activities.update({_id: this._id}, {$set: {saturday: result}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .sunday-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var docId = this._id;
		var text = this.sunday;
		var height = $('#' + docId + 'sunday-cell-text').height();
		$('#' + docId + 'sunday-cell-text').toggleClass('hidden');
		$('#' + docId + 'sunday-cell-input').height(height);
		$('#' + docId + 'sunday-cell-input').toggleClass('hidden');
		$('#' + docId + 'sunday-cell-input').val(text);
		$('#' + docId + 'sunday-cell-input').focus();
	},

	'blur .sunday-input': function(e){
		var docId = this._id;
		var text = $('#' + docId + 'sunday-cell-input').val();
		var values = text.split(",");
		var result = [];
		for(i=0; i < values.length; i++){
			result.push(values[i].replace(/ /g,''));
		}
		Activities.update({_id: this._id}, {$set: {sunday: result}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'click .fa-sign-in': function(e){
		Router.go('formDatabase', {_id: this._id});
	},
});