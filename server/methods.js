Meteor.methods({
	createIndex: function(){
		var index = Activities.find().count() + 1;
		return index;
	}
});