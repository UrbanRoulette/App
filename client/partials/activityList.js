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

Template.activityList.onRendered(function() {
  var self = this;
  self.autorun(function() {
    self.$('.activity-list__activity').removeClass('activity-list__activity--hovered');
    if (_.isNumber(Session.get('pin_hovered_id'))) {
      self.$('.activity-list__activity:eq(' + Session.get('pin_hovered_id') + ')').addClass('activity-list__activity--hovered');
    }
  })
})

Template.activityList.events({
  'click .activity-list__retry': function() {
    callServer();
  },
  'mouseenter .activity-list__activity': function(event) {
    Session.set('activity_hovered_index', parseInt(event.target.dataset.index));
  },
  'mouseleave .activity-list__activity': function() {
    Session.set('activity_hovered_index', false);
  }
});

Template.activityList.helpers({
  activities: function() {
    return Session.get('activities_results');
  },
  isNotEmpty: function() {
    if (typeof(Session.get('activities_results')) === 'undefined') return false;
    return Session.get('activities_results').length != 0;
  },
});