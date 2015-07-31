Meteor.publish('activities', function(){
	return Activities.find({});
});

Meteor.publish('activityToModify', function(activityId){
	return Activities.findOne({_id: activityId});
});

Meteor.publish('activitieswaiting', function(){
	return Activitieswaiting.find({});
});

Meteor.publish('rouletteResults',function(rouletteResultsId){
	return Activities.find({_id: {$in : rouletteResultsId}});	
});

Meteor.publish('singleActivity', function(id) {
//  check(id, String);
  return Activities.find(id);
});