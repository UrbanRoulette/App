var googleMapHelper = function(map) {
  var self = this;

  this.markers = [];
  this.locations = [];
  this.map = map;
  this.bounds = new google.maps.LatLngBounds();
  this.directionsDisplay = new google.maps.DirectionsRenderer();
  this.directionsService = new google.maps.DirectionsService();
  this.directionsDisplay.setMap(map.instance);

  var resizeTimer;
  $(window).resize(function() {

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      self.adjustMap();
    }, 250);
  });

  this.geocode = function(address, success, error) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': address
    }, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) return success(results);
      return error(status);
    });
  };

  this.addMarker = function(position) {
    var marker = new google.maps.Marker({
      map: self.map.instance,
      position: position
    });
    self.markers.push(marker);
  };

  this.setMapOnAll = function() {
    for (var i = 0; i < self.markers.length; i++) {
      self.markers[i].setMap(self.map);
    }
  };

  this.clearMarkers = function() {
    self.setMapOnAll(null);
  };

  this.addLocation = function(location) {
    self.locations.push(location);
    self.bounds.extend(location);
  };

  this.adjustMap = function()  {
    self.map.instance.fitBounds(self.bounds);
  };

  this.getWaypoints = function() {
    var waypoints = [];
    _.each(self.locations, function(location) {
      if (location != _.first(self.locations) && location != _.last(self.locations)) {
        waypoints.push({
          location: location,
          stopover: true
        });
      }
    });
    return waypoints;
  }

  this.calcRoute = function() {
    var request = {
      origin: self.locations[0],
      destination: self.locations[self.locations.length - 1],
      waypoints: self.getWaypoints(),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
    };

    self.directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) self.directionsDisplay.setDirections(result);
    });
  }
};


Template.map.helpers({
  mapOptions: function() {
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(-37.8136, 144.9631),
        zoom: 9
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

        var locations = [];
        helper.locations = [];

        _.each(Session.get('activities_results'), function(activity) {
          locations.push([activity.index.coordinates[1], activity.index.coordinates[0]]);
        });

        // Each address given
        _.each(locations, function(address) {

          var location = new google.maps.LatLng(address[0], address[1]);
          helper.addLocation(location);

          // If last address
          if (address == _.last(locations)) {

            // Adjust map and calculate itinary
            helper.adjustMap();
            helper.calcRoute();
          }
        });
      }
    });
  });
});