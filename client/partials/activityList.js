var get_results = function(center,max_radius,date,timezoneOffset,profile){
    Meteor.apply('get_activities_results', [center,max_radius,date,timezoneOffset,profile,Session.get("weather"),Session.get("activities_locked"),Session.get("activities_drawn"),Session.get("types_removed")], true, function(error, result) {
      if (error) console.log(error);
      else {
        var activities_locked = [];
        var activities_drawn = Session.get("activities_drawn");
        _.each(Session.get("activities_locked"),function(activity,index){
          activities_drawn.splice(activities_drawn.indexOf(activity._id),1);
        });
        if(_.some(result, function(activity){return activities_drawn.indexOf(activity._id) !== -1;})) activities_drawn = [];
        _.each(result,function(activity,index){
          if(activity.locked) activities_locked.push(activity);
          activities_drawn.push(activity._id);
        });
        Session.set('activities_drawn', activities_drawn);
        Session.set('activities_locked', activities_locked);
        Session.set('activities_results', result);
      }
    });
};

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
        Session.set("currentSearchLatLng", [center.lng,center.lat]);

        var max_radius = 10;
        var date = new Date();
        var timezoneOffset = date.getTimezoneOffset();
        var profile = ["gratuit", "cheap", "exterieur", "curieux", "couple", "solo", "potes", "prestige"];

        if(typeof Session.get("activities_locked") === 'undefined') Session.set("activities_locked", []);
        if(typeof Session.get("activities_drawn") === 'undefined') Session.set("activities_drawn", []);
        if(typeof Session.get("types_removed") === 'undefined') Session.set("types_removed", []);
        if(typeof Session.get("weather") === "undefined"){
          Meteor.apply('get_weather',[center],true,function(error,result){
            if(error) console.log(error);
            else {
              Session.set("weather",result);
              get_results(center,max_radius,date,timezoneOffset,profile);
            }
          });
        }
        else get_results(center,max_radius,date,timezoneOffset,profile);
      }
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
  });
});

Template.activityList.events({
  'click .activity-list__retry': function() {
    Session.set("activities_switched", []);
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
    return Session.get('activities_results').length !== 0;
  },
});