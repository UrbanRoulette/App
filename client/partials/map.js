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

Template.map.onRendered(function() {
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
          return;
        }
        
        // Loop trough each result
        _.each(Session.get('activities_results'), function(activity, index) {
          var location = new google.maps.LatLng(activity.index.coordinates[1], activity.index.coordinates[0]);
          helper.addLocation(location);

          // If last address
          if (index + 1 === Session.get('activities_results').length) {

            // Reset style to normal
            helper.mapActive();

            // Adjust map and calculate itinary
            helper.adjustMap();
            helper.calcRoute();
          }

        });
      }
    });

    self.autorun(function() {
      if (helper.markers.length !== 0) {
        _.each(helper.markers, function(marker) {
          marker.setAnimation(null);
        });
      }
      if (_.isNumber(Session.get('activity_hovered_index')) && helper.markers.length !== 0) {
        helper.markers[Session.get('activity_hovered_index')].setAnimation(google.maps.Animation.BOUNCE);
      }
    });
  });
});