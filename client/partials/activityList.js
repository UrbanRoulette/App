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
        var date = new Date();
        console.log(date);
        //var timezoneOffset = date.getTimezoneOffset();
        var profile = ["gratuit", "cheap", "exterieur", "curieux", "couple", "solo", "potes", "prestige"];
        var timezoneOffset = 0;
        var activities_locked = Session.get('activities_locked');
        if(activities_locked){} else activities_locked = []; 
        //console.log(timezoneOffset);
        var radius = 10 / 3963.192; //Converts miles into radians. Should be divided by 6378.137 for kilometers
        Meteor.apply('get_activities_results', [center,radius,date,profile,timezoneOffset,activities_locked], true, function(error, result) {
          if (error)
            console.log(error);
          else {
            var activities_locked = [];
            for(k=0;k<result.length;k++){
              console.log(result[k].locked);
              if(result[k].locked) activities_locked.push(result[k]);
            }
            Session.set('activities_locked', activities_locked);
            Session.set('activities_results',result);
            console.log(result);
          }
        });
      }
      // return error(status);
    });
  },
});

Template.activityList.helpers({
  activities: function() {
    return Session.get('activities_results');
  }
});