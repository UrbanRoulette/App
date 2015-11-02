var googleMapHelper = function(map) {
  var self = this;

  this.markers = [];
  this.locations = [];
  this.map = map;
  this.bounds = new google.maps.LatLngBounds();
  this.directionsDisplay = new google.maps.DirectionsRenderer();
  this.directionsService = new google.maps.DirectionsService();
  this.directionsDisplay.setMap(map.instance);

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
}

// setupMapHelper
var setupMap = function(map, addresses) {

  var helper = new googleMapHelper(map);

  // Each address given
  _.each(addresses, function(address) {

    // Geocode address
    helper.geocode(address, function(results) {

      helper.addLocation(results[0].geometry.location);

      // If last address
      if (address == _.last(addresses)) {

        // Adjust map and calculate itinary
        helper.adjustMap();
        helper.calcRoute();
      }
    }, function(error) {
      console.log(error);
    });
  });

}

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
    self.autorun(function() {
      if (Session.get('fakeLocations')) {
        setupMap(map, Session.get('fakeLocations'));
      }
    });
  });
});