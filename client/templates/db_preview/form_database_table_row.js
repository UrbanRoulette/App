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
//		$('#' + index +'table-see-more-description').toggleClass('see-more-selected');
		$('#' + index +'table-see-more-description').toggleClass('see-more-selected');
	},
	'click .table-see-more-hours': function(e){
		var index = this.index;
		$('#' + index + 'table-see-more-hours').toggleClass('see-more-selected'); 
	}

});