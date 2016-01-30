// Should be a BE method
getResult = function(center, callback){

    var max_radius = 10;
    var profile = ["gratuit", "cheap", "exterieur", "curieux", "couple", "solo", "potes", "prestige"];
    var date = new Date();
    var timezoneOffset = date.getTimezoneOffset();
    var current_results = Session.get("activities_results");
    var last_start_date = (typeof current_results !== "undefined") ? current_results[0].start_date : null;
    var diff_time = last_start_date ? (date - last_start_date) : 0;

    if(typeof Session.get("activities_locked") === 'undefined') Session.set("activities_locked", []);
    if(typeof Session.get("activities_drawn") === 'undefined') Session.set("activities_drawn", []);
    if(typeof Session.get("types_removed") === 'undefined') Session.set("types_removed", []);

    Meteor.apply('get_activities_results', [center,max_radius,date,timezoneOffset,diff_time,profile,Session.get("weather"),Session.get("activities_locked"),Session.get("activities_drawn"),Session.get("types_removed")], true, function(error, result) {
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

        if(typeof(callback) == 'function') callback();
      }
    });
};

// Should be a BE method
callServer = function() {
  Session.set('loading', true)
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
        if(typeof Session.get("weather") === "undefined"){
          Meteor.apply('get_weather',[center],true,function(error,result){
            if(error) console.log(error);
            else {
              Session.set("weather",result);
              getResult(center, function(){
                Session.set('loading', false)
              });
            }
          });
        }
        else getResult(center, function(){
          Session.set('loading', false)
        });
      }
    });
  }
};

// Should be BE method
switchActivity = function(activity){
  var activities_switched = typeof(Session.get('activities_switched')) !== 'undefined' ? Session.get('activities_switched') : [];
  activities_switched.push(activity._id);
  Session.set('activities_switched', activities_switched);

  var activities_results = Session.get('activities_results');
  var index = _.indexOf(activities_results, _.findWhere(activities_results, {_id: activity._id}));
  //Recording locations
  if(index > 0) activity.previous_coord = activities_results[index-1].index.coordinates;
  if(index < activities_results.length - 1) activity.next_coord = activities_results[index+1].index.coordinates; 
  activity.initial_coord = Session.get("currentSearchLatLng");

  var profile = ["gratuit", "cheap", "exterieur", "curieux", "couple", "solo", "potes", "prestige"];
  var max_radius = 10; //Converts miles into radians. Should be divided by 6378.137 for kilometers
  var timezoneOffset = new Date().getTimezoneOffset();
  Meteor.apply('switch_activity', [activity,activities_switched,max_radius,timezoneOffset,profile,Session.get("weather")], true, function(error, result) {
    if (error)
      console.log(error);
    else {
      if(typeof result === "object"){
        if(activities_switched.indexOf(result._id) > -1) Session.set('activities_switched',[result._id]);
        activities_results.splice(index,1,result);
        Session.set('activities_results',activities_results);
      }
      else alert(result);
    }
  });
}

//shud be BE
removeActivity = function (activity) {
  //Removing types from next draws
  var types_removed = typeof(Session.get('types_removed')) !== 'undefined' ? Session.get('types_removed') : [];
  types_removed.push(activity.classification.type);
  Session.set('types_removed', types_removed);
  //Deleting activity
  var activities_results = Session.get("activities_results");
  activities_results.splice(_.indexOf(activities_results, _.findWhere(activities_results, {_id: activity._id})),1);
  Session.set("activities_results",activities_results);
}