<<<<<<< HEAD
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
  };

  this.calcRoute = function() {
    var request = {
      origin: self.locations[0],
      destination: self.locations[self.locations.length - 1],
      waypoints: self.getWaypoints(),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.WALKING
    };
    self.directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK){ 
        self.directionsDisplay.setDirections(result);
        console.log(result);
        //Find discoveries on the way
        var legs = result.routes[0].legs;
        var discoveries = {};
        
        for(i=0;i<legs.length;i++){
          discoveries[i] = [];
          var steps = legs[i].steps;

          for(j=0;j<steps.length;j++){
            var lat_lngs = steps[j].lat_lngs;
            var discovery = null;

            for(l=0;l<lat_lngs.length;l++){
              var lat_lng = formatData(lat_lngs[l]);
              discovery = Activities.findOne(
                { type: {$in: ["discovery"]},
                  index: {
                    $near: {
                     $geometry: {type: "Point" , coordinates: [lat_lng.lng,lat_lng.lat]},
                     $maxDistance: 200 //Distance is in meters
                  }
                }
              });
              if(discovery) break;            
            }
            if(discovery){
              discoveries[i].push(discovery);
              break;
            }    
          }
        }
        console.log("DISCOVERIES : " + discoveries);
      }
    });
  };
};


=======
>>>>>>> f46e2f02b3be772231a6eba62471307e5bfc7265
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
<<<<<<< HEAD
  formatData = function(data) {
      //data is a LatLng Object
      var obj = {};
          obj.lat = data.lat();
          obj.lng = data.lng();
      return obj;     
  };
=======

>>>>>>> f46e2f02b3be772231a6eba62471307e5bfc7265
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
        _.each(Session.get('activities_results'), function(activity) {

          // Create location object
          var location = new google.maps.LatLng(activity.index.coordinates[1], activity.index.coordinates[0]);
          helper.addLocation(location);

          // If last address
          if (activity._id == _.last(Session.get('activities_results'))._id) {

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