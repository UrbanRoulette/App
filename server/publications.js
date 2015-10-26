Meteor.publish('activities', function(){
	return Activities.find();
});

Meteor.publish('images', function(){
	return Images.find();
});