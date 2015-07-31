Template.formDatabaseTable.helpers({
	item: function() {
		return Activities.find({}, {sort: {district: 1}});
	}
});