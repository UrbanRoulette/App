var showMap = function(map, address) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    'address': address
  }, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      map.instance.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: map.instance,
        position: results[0].geometry.location
      });
      if (results[0].geometry.viewport) map.instance.fitBounds(results[0].geometry.viewport);
      centerPin(map);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
};

var centerPin = function(map) {
  var marker = new google.maps.Marker({
    position: map.options.center,
    map: map.instance
  });
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
    self.autorun(function() {
      if (Session.get('currentSearch')) {
        showMap(map, Session.get('currentSearch'));
      }
    });
  });
});