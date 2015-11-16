Template.map.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(-37.8136, 144.9631),
        zoom: 9,
        styles: mapGrey,
        disableDefaultUI: true
      };
    }
  },
});

Template.map.onCreated(function() {
  var self = this;

  GoogleMaps.ready('map', function(map) {

    var helper = new googleMapHelper(map);

    self.autorun(function() {
      if (Session.get('activities_results')) {

        // Reset helper, remove locations & hide itinary
        helper.reset();
        helper.mapInactive();

        // If no activity, return;
        if (Session.get('activities_results').length === 0) {
          console.log('empty');
          return;
        }

        // Loop trough each result
        _.each(Session.get('activities_results'), function(activity) {
          console.log(activity);
          // Create location object
          var location = new google.maps.LatLng(activity.index.coordinates[1], activity.index.coordinates[0]);
          helper.addLocation(location);

          // If last address
          if (activity == _.last(Session.get('activities_results'))) {

            // Reset style to normal
            helper.mapActive();

            // Adjust map and calculate itinary
            helper.adjustMap();
            helper.calcRoute();
          }

        });
      }
    });
  });
});