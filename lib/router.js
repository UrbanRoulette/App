Router.configure({
  loadingTemplate: 'loading',
  waitOn: function() {
    return [
    Meteor.subscribe('activities'),
    Meteor.subscribe('images'),
    ];
  }
});

Router.onBeforeAction(function() {
/*  GoogleMaps.load({
    key: 'AIzaSyDfc_LzQZwwLngNGjWFp74np2XpSx7_lBA',
    libraries: 'places'
  });
*/  this.next();
}, {
  only: ['home', 'search']
});


// Landing page
Router.route('/', {
  name: 'home',
  template: 'landingPage',
  layoutTemplate: 'mainLayout',
  onBeforeAction: function() {
    Session.set("documentTitle", "UrbanRoulette - Home");
    this.next();
  }
});

// Landing page
Router.route('/search/:keyword', {
  name: 'search',
  template: 'searchView',
  layoutTemplate: 'mainLayout',
  onBeforeAction: function() {
    Session.set('currentSearch', this.params.keyword);
    Session.set("documentTitle", "UrbanRoulette - Search - " + this.params.keyword);
    this.next();
  }
});

