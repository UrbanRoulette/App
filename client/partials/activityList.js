var callServer = function() {
  if (GoogleMaps.loaded()) {
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
  }
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
  },
  'mouseenter .activity-list__activity': function() {
    Session.set('activity_hovered_id', this._id);
  },
  'mouseleave .activity-list__activity': function() {
    Session.set('activity_hovered_id', false);
  }
});

Template.activityList.helpers({
  activities: function() {
    return Session.get('activities_results');
  },
  hovered: function() {
    return this._id == Session.get('pin_hovered_id');
  },
  isNotEmpty: function() {
    if (typeof(Session.get('activities_results')) === 'undefined') return false;
    return Session.get('activities_results').length != 0;
  },
});