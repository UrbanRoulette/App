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
        var date = new Date();

        //var timezoneOffset = date.getTimezoneOffset();
        var profile = ["gratuit", "cheap", "exterieur", "curieux", "couple", "solo", "potes", "prestige"];
        var timezoneOffset = 0;
        if(typeof Session.get("weatherId") === "undefined"){
        var URLrequest =  "http://api.openweathermap.org/data/2.5/weather?lat=" + center.lat + "&lon=" + center.lng + "&APPID=c8c3d5213625cfb230413935cb2ee5e9";
        HTTP.call("GET", URLrequest,
                  function (error, result) {
                    if (error) {
                      console.log(error);
                    }
                    else {
                        var weatherId = result.data.weather[0].id;
                        Session.set("weatherId",weatherId);
                    }
                  });
        }
        var weatherId = Session.get("weatherId");
        var activities_locked = typeof(Session.get('activities_locked')) == 'undefined' ? [] : Session.get('activities_locked');
        //console.log(timezoneOffset);
        var radius = 10 / 3963.192; //Converts miles into radians. Should be divided by 6378.137 for kilometers
        Meteor.apply('get_activities_results', [center,radius,date,profile,timezoneOffset,weatherId,activities_locked], true, function(error, result) {
          if (error)
            console.log(error);
          else {
            var activities_locked = [];
            for(k=0;k<result.length;k++){
              if(result[k].locked) activities_locked.push(result[k]);
            }
            Session.set('activities_locked', activities_locked);
            Session.set('activities_results',result);
          }
        });
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
    return Session.get('activities_results').length !== 0;
  },
});