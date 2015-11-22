Meteor.publish('activities', function(){
	return Activities.find();
});

Meteor.publish('draws', function(){
	return Draws.find();
});