mapGrey = [{
  "featureType": "water",
  "elementType": "geometry",
  "stylers": [{
    "color": "#e9e9e9"
  }, {
    "lightness": 17
  }]
}, {
  "featureType": "landscape",
  "elementType": "geometry",
  "stylers": [{
    "color": "#f5f5f5"
  }, {
    "lightness": 20
  }]
}, {
  "featureType": "road.highway",
  "elementType": "geometry.fill",
  "stylers": [{
    "color": "#ffffff"
  }, {
    "lightness": 17
  }]
}, {
  "featureType": "road.highway",
  "elementType": "geometry.stroke",
  "stylers": [{
    "color": "#ffffff"
  }, {
    "lightness": 29
  }, {
    "weight": 0.2
  }]
}, {
  "featureType": "road.arterial",
  "elementType": "geometry",
  "stylers": [{
    "color": "#ffffff"
  }, {
    "lightness": 18
  }]
}, {
  "featureType": "road.local",
  "elementType": "geometry",
  "stylers": [{
    "color": "#ffffff"
  }, {
    "lightness": 16
  }]
}, {
  "featureType": "poi",
  "elementType": "geometry",
  "stylers": [{
    "color": "#f5f5f5"
  }, {
    "lightness": 21
  }]
}, {
  "featureType": "poi.park",
  "elementType": "geometry",
  "stylers": [{
    "color": "#dedede"
  }, {
    "lightness": 21
  }]
}, {
  "featureType": "all",
  "elementType": "labels",
  "stylers": [
  {
    "visibility": "off"
  }]
}, {
  "elementType": "labels.icon",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "transit",
  "elementType": "geometry",
  "stylers": [{
    "color": "#f2f2f2"
  }, {
    "lightness": 19
  }]
}, {
  "featureType": "administrative",
  "elementType": "geometry.fill",
  "stylers": [{
    "color": "#fefefe"
  }, {
    "lightness": 20
  }]
}, {
  "featureType": "administrative",
  "elementType": "geometry.stroke",
  "stylers": [{
    "color": "#fefefe"
  }, {
    "lightness": 17
  }, {
    "weight": 1.2
  }]
}];

googleMapHelper = function(map) {
  var self = this;

  this.markers = [];
  this.locations = [];
  this.map = map;
  this.bounds = new google.maps.LatLngBounds();

  this.directionsDisplay = new google.maps.DirectionsRenderer({
    suppressMarkers: true
  });

  this.directionsService = new google.maps.DirectionsService();
  this.directionsDisplay.setMap(map.instance);


  var resizeTimer;
  $(window).resize(function() {

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      self.adjustMap();
    }, 250);
  });

  this.reset = function() {
    self.clearMarkers();
    self.markers = [];
    self.locations = [];
    self.hideItinary();
  };

  this.mapInactive = function() {
    map.instance.setOptions({
      styles: mapGrey
    });
  };

  this.mapActive = function() {
    map.instance.setOptions({
      styles: []
    });
  };

  this.geocode = function(address, success, error) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': address
    }, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) return success(results);
      return error(status);
    });
  };

  this.addMarker = function(position, icon, metadata) {
    icon = typeof(icon) == 'undefined' ? 'pin.svg' : icon;


    var marker = new google.maps.Marker({
      map: self.map.instance,
      position: position,
      icon: '/images/pin/' + icon
    });

    self.markers.push(marker);

    marker.index = self.markers.length - 1;

    marker.addListener('mouseover', function() {
      Session.set('pin_hovered_id', marker.index);
    });

    marker.addListener('mouseout', function() {
      Session.set('pin_hovered_id', false);
    });
  };

  this.setMapOnAll = function(map) {
    for (var i = 0; i < self.markers.length; i++) {
      self.markers[i].setMap(map);
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
  };

  this.calcRoute = function() {
    var self = this;

    var request = {
      origin: self.locations[0],
      destination: self.locations[self.locations.length - 1],
      waypoints: self.getWaypoints(),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.WALKING
    };

    self.directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) self.directionsDisplay.setDirections(result);
      var legs = result.routes[0].legs;
      _.each(legs, function(leg, index) {
        if (leg == _.first(legs)) {
          self.addMarker(leg.start_location, 'pin--start.svg');
        } else {
          self.addMarker(leg.start_location, 'pin.svg');
        }
        if (leg == _.last(legs)) {
          self.addMarker(leg.end_location, 'pin--end.svg');
        }
      });

//      var discoveries = Meteor.call('get_discoveries_and_transportation',legs);
      // var discoveries = [];
      // var duration = [];
      //
      // for (i = 0; i < legs.length; i++) {
      //   var leg = legs[i];
      //   var steps = leg.steps;
      //   duration.push(leg.duration.text);
      //   for (j = 0; j < steps.length; j++) {
      //     var lat_lngs = steps[j].lat_lngs;
      //     var discovery = null;
      //     for (l = 0; l < lat_lngs.length; l++) {
      //       discovery = Activities.findOne({
      //         "classification.class": {
      //           $in: ["Discovery"]
      //         },
      //         index: {
      //           $near: {
      //             $geometry: {
      //               type: "Point",
      //               coordinates: [lat_lngs[l].lng(), lat_lngs[l].lat()]
      //             },
      //             $maxDistance: 200 //Distance is in meters
      //           }
      //         }
      //       });
      //       if (discovery) break;
      //     }
      //     if (discovery) {
      //       discoveries.push(Object(discovery));
      //       break;
      //     }
      //   }
      // }
      //
      // _.each(discoveries, function(discovery) {
      //   var location = new google.maps.LatLng(discovery.index.coordinates[1], discovery.index.coordinates[0]);
      //   self.addMarker(location, 'pin--star.svg');
      // });

    });
  };

  this.hideItinary = function() {
    self.directionsDisplay.setDirections({
      routes: []
    });
  };
};