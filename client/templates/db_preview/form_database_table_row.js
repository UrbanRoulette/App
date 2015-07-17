Template.formDatabaseTableRow.events({
	'click .fa-times': function(e){
		if (confirm("Etes-vous sûr de vouloir supprimer cette activité ?")) {
			var index = this.index;
			Activities.remove({_id: this._id});
			Activities.find().forEach(function(doc){
				if (doc.index > index) {
					newIndex = doc.index - 1;
					Activities.update({_id: doc._id}, {$set: {index: newIndex}});
				}
			});
		}
	},

	'click .table-see-more-description': function(e){
		var index = this.index;
		if ($('#' + index + 'table-see-more-description').html() === "Voir plus..."){
			$('#' + index +'description-cell-text').addClass('see-more-selected');
			$('#' + index + 'table-see-more-description').html('Masquer');
		}
		else {
			$('#' + index +'description-cell-text').removeClass('see-more-selected');
			$('#' + index + 'table-see-more-description').html('Voir plus...');
		}
	},
	'click .table-see-more-hours': function(e){
		var index = this.index;
		if ($('#' + index + 'table-see-more-hours').html() === "Voir plus..."){
			$('#' + index +'hours-cell-text').addClass('see-more-selected');
			$('#' + index + 'table-see-more-hours').html('Masquer');
		}
		else {
			$('#' + index +'hours-cell-text').removeClass('see-more-selected');
			$('#' + index + 'table-see-more-hours').html('Voir plus...');
		}
	},

	'keydown': function(e){
		if (e.keyCode === 27){
			$('.table-input').addClass('hidden');
			$('.cell-text').removeClass('hidden');	
		}
	},

	'dblclick .specific-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var index = this.index;
		var text = this.specific;
		var height = $('#' + index + 'specific-cell-text').height();
		$('#' + index + 'specific-cell-text').toggleClass('hidden');
		$('#' + index + 'specific-cell-input').height(height);
		$('#' + index + 'specific-cell-input').toggleClass('hidden');
		$('#' + index + 'specific-cell-input').val(text);
		$('#' + index + 'specific-cell-input').focus();
	},
	'blur .specific-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'specific-cell-input').val();
		Activities.update({_id: this._id}, {$set: {specific: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .name-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var index = this.index;
		var text = this.name;
		var height = $('#' + index + 'name-cell-text').height();
		$('#' + index + 'name-cell-text').toggleClass('hidden');
		$('#' + index + 'name-cell-input').height(height);
		$('#' + index + 'name-cell-input').toggleClass('hidden');
		$('#' + index + 'name-cell-input').val(text);
		$('#' + index + 'name-cell-input').focus();
	},

	'blur .name-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'name-cell-input').val();
		Activities.update({_id: this._id}, {$set: {name: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .type-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var index = this.index;
		var text = this.type;
		var height = $('#' + index + 'type-cell-text').height();
		$('#' + index + 'type-cell-text').toggleClass('hidden');
		$('#' + index + 'type-cell-input').height(height);
		$('#' + index + 'type-cell-input').toggleClass('hidden');
		$('#' + index + 'type-cell-input').val(text);
		$('#' + index + 'type-cell-input').focus();
	},

	'blur .type-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'type-cell-input').val();
		Activities.update({_id: this._id}, {$set: {type: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .address-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var index = this.index;
		var text = this.address;
		var height = $('#' + index + 'address-cell-text').height();
		$('#' + index + 'address-cell-text').toggleClass('hidden');
		$('#' + index + 'address-cell-input').height(height);
		$('#' + index + 'address-cell-input').toggleClass('hidden');
		$('#' + index + 'address-cell-input').val(text);
		$('#' + index + 'address-cell-input').focus();
	},

	'blur .address-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'address-cell-input').val();
		Activities.update({_id: this._id}, {$set: {address: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .description-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var index = this.index;
		var text = this.description;
		var height = $('#' + index + 'description-cell-text').height();
		$('#' + index + 'description-cell-text').toggleClass('hidden');
		$('#' + index + 'description-cell-input').height(height);
		$('#' + index + 'description-cell-input').toggleClass('hidden');
		$('#' + index + 'description-cell-input').val(text);
		$('#' + index + 'description-cell-input').focus();
	},

	'blur .description-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'description-cell-input').val();
		Activities.update({_id: this._id}, {$set: {description: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .price-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var index = this.index;
		var text = this.price;
		var height = $('#' + index + 'price-cell-text').height();
		$('#' + index + 'price-cell-text').toggleClass('hidden');
		$('#' + index + 'price-cell-input').height(height);
		$('#' + index + 'price-cell-input').toggleClass('hidden');
		$('#' + index + 'price-cell-input').val(text);
		$('#' + index + 'price-cell-input').focus();
	},

	'blur .price-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'price-cell-input').val();
		Activities.update({_id: this._id}, {$set: {price: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .last-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var index = this.index;
		var text = this.last;
		var height = $('#' + index + 'last-cell-text').height();
		$('#' + index + 'last-cell-text').toggleClass('hidden');
		$('#' + index + 'last-cell-input').height(height);
		$('#' + index + 'last-cell-input').toggleClass('hidden');
		$('#' + index + 'last-cell-input').val(text);
		$('#' + index + 'last-cell-input').focus();
	},

	'blur .last-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'last-cell-input').val();
		Activities.update({_id: this._id}, {$set: {last: Number(text)}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .link-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var index = this.index;
		var text = this.link;
		var height = $('#' + index + 'link-cell-text').height();
		$('#' + index + 'link-cell-text').toggleClass('hidden');
		$('#' + index + 'link-cell-input').height(height);
		$('#' + index + 'link-cell-input').toggleClass('hidden');
		$('#' + index + 'link-cell-input').val(text);
		$('#' + index + 'link-cell-input').focus();
	},

	'blur .link-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'link-cell-input').val();
		Activities.update({_id: this._id}, {$set: {link: text}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},

	'dblclick .monday-cell': function(e){
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
		var index = this.index;
		var text = this.monday;
		var height = $('#' + index + 'monday-cell-text').height();
		$('#' + index + 'monday-cell-text').toggleClass('hidden');
		$('#' + index + 'monday-cell-input').height(height);
		$('#' + index + 'monday-cell-input').toggleClass('hidden');
		$('#' + index + 'monday-cell-input').val(text);
		$('#' + index + 'monday-cell-input').focus();
	},

	'blur .monday-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'monday-cell-input').val();
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
		var index = this.index;
		var text = this.tuesday;
		var height = $('#' + index + 'tuesday-cell-text').height();
		$('#' + index + 'tuesday-cell-text').toggleClass('hidden');
		$('#' + index + 'tuesday-cell-input').height(height);
		$('#' + index + 'tuesday-cell-input').toggleClass('hidden');
		$('#' + index + 'tuesday-cell-input').val(text);
		$('#' + index + 'tuesday-cell-input').focus();
	},

	'blur .tuesday-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'tuesday-cell-input').val();
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
		var index = this.index;
		var text = this.wednesday;
		var height = $('#' + index + 'wednesday-cell-text').height();
		$('#' + index + 'wednesday-cell-text').toggleClass('hidden');
		$('#' + index + 'wednesday-cell-input').height(height);
		$('#' + index + 'wednesday-cell-input').toggleClass('hidden');
		$('#' + index + 'wednesday-cell-input').val(text);
		$('#' + index + 'wednesday-cell-input').focus();
	},

	'blur .wednesday-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'wednesday-cell-input').val();
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
		var index = this.index;
		var text = this.thursday;
		var height = $('#' + index + 'thursday-cell-text').height();
		$('#' + index + 'thursday-cell-text').toggleClass('hidden');
		$('#' + index + 'thursday-cell-input').height(height);
		$('#' + index + 'thursday-cell-input').toggleClass('hidden');
		$('#' + index + 'thursday-cell-input').val(text);
		$('#' + index + 'thursday-cell-input').focus();
	},

	'blur .thursday-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'thursday-cell-input').val();
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
		var index = this.index;
		var text = this.friday;
		var height = $('#' + index + 'friday-cell-text').height();
		$('#' + index + 'friday-cell-text').toggleClass('hidden');
		$('#' + index + 'friday-cell-input').height(height);
		$('#' + index + 'friday-cell-input').toggleClass('hidden');
		$('#' + index + 'friday-cell-input').val(text);
		$('#' + index + 'friday-cell-input').focus();
	},

	'blur .friday-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'friday-cell-input').val();
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
		var index = this.index;
		var text = this.saturday;
		var height = $('#' + index + 'saturday-cell-text').height();
		$('#' + index + 'saturday-cell-text').toggleClass('hidden');
		$('#' + index + 'saturday-cell-input').height(height);
		$('#' + index + 'saturday-cell-input').toggleClass('hidden');
		$('#' + index + 'saturday-cell-input').val(text);
		$('#' + index + 'saturday-cell-input').focus();
	},

	'blur .saturday-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'saturday-cell-input').val();
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
		var index = this.index;
		var text = this.sunday;
		var height = $('#' + index + 'sunday-cell-text').height();
		$('#' + index + 'sunday-cell-text').toggleClass('hidden');
		$('#' + index + 'sunday-cell-input').height(height);
		$('#' + index + 'sunday-cell-input').toggleClass('hidden');
		$('#' + index + 'sunday-cell-input').val(text);
		$('#' + index + 'sunday-cell-input').focus();
	},

	'blur .sunday-input': function(e){
		var index = this.index;
		var text = $('#' + index + 'sunday-cell-input').val();
		var values = text.split(",");
		var result = [];
		for(i=0; i < values.length; i++){
			result.push(values[i].replace(/ /g,''));
		}
		Activities.update({_id: this._id}, {$set: {sunday: result}});
		$('.table-input').addClass('hidden');
		$('.cell-text').removeClass('hidden');
	},
});