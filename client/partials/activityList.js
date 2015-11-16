Template.activityList.events({
  'click .activity-list__retry': function() {



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
          if (error)
            console.log(error);
          else {
            Session.set('activities_results', result);
            console.log(result);
          }
        });
      };
      // return error(status);
    });





  },

});

Template.activityList.helpers({
  activities: function() {
    return Session.get('activities_results');
  }
});