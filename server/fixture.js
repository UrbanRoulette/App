var activitiesList = Activities.find().count();
// Activities.remove({});
// if we already have entries in the db, don't insert again.
if (activitiesList > 0) return;

// code to run on server at startup
Assets.getText('activities.txt', function(err, data) {

  var content = EJSON.parse(data);

  for (var activity in content) {
    Activities.insert(content[activity]);
  }
});