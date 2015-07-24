Template.formDatabaseTable.helpers({
	item: function() {
		return Activities.find({}, {sort: {index: 1}});
	}
});