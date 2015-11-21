var callServer = function() {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    'address': Session.get("currentSearch")
  }, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      var center = {
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng()
      };
      var radius = 1 / 3963.2; //Converts miles into radians
      Meteor.apply('get_activities_results', [center, radius], true, function(error, result) {
        if (error) {
          Alert(error, 'error');
        } else {
          Session.set('activities_results', result);
        }
      });
    };
  });
};

Template.activityList.onCreated(function() {

  var self = this;
  if (!Session.get('activities_results')) return callServer();

  self.autorun(function() {
    if (Session.get('currentSearch')) {
      callServer();
    }
  });

});

Template.activityList.events({
  'click .activity-list__retry': function() {
    callServer();
  }
});

Template.activityList.helpers({
  activities: function() {
    return Session.get('activities_results');
  }
});