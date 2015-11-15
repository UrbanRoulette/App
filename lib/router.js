/* Logged-in / out helper */
var checkIfLoggedOut = function(pause) {
  if (!(Meteor.user() || Meteor.loggingIn())) {
    return Router.go('login');
  }
};

var checkIfLoggedIn = function(pause) {
  if (Meteor.user()) {
    return Router.go('/');
  }
};


/* Router config */
Router.configure({
  loadingTemplate: 'loading',
});

Router.onBeforeAction(function() {
  GoogleMaps.load({
    key: 'AIzaSyDfc_LzQZwwLngNGjWFp74np2XpSx7_lBA',
    libraries: 'places'
  });
  this.next();
}, {
  only: ['home', 'search']
});


/* User Route */
Router.route('/login', {
  name: 'login',
  template: 'login',
  layoutTemplate: 'simpleForm',
  onBeforeAction: function() {
    checkIfLoggedIn();
    Session.set("documentTitle", "Login");
    this.next();
  }
});

Router.route('/forgot', {
  name: 'forgot',
  template: 'forgotPassword',
  layoutTemplate: 'simpleForm',
  onBeforeAction: function() {
    checkIfLoggedIn();
    Session.set("documentTitle", "Forgot password");
    this.next();
  }
});

Router.route('/signup', {
  name: 'signup',
  template: 'signup',
  layoutTemplate: 'simpleForm',
  onBeforeAction: function() {
    checkIfLoggedIn();
    Session.set("documentTitle", "Signup");
    this.next();
  }
});

Router.route('/profile', {
  name: 'profile',
  template: 'profile',
  layoutTemplate: 'simpleForm',
  onBeforeAction: function() {
    checkIfLoggedOut();
    Session.set("documentTitle", "Profile");
    this.next();
  }
});

Router.route('/reset/:token', {
  name: 'reset',
  template: 'resetPassword',
  layoutTemplate: 'simpleForm',
  onBeforeAction: function() {
    if (Meteor.user()) return Router.go('/');
    Accounts._resetPasswordToken = this.params.token;
    this.next();
  }
});



/* App Route */
Router.route('/', {
  name: 'home',
  template: 'landingPage',
  layoutTemplate: 'mainLayout',
  onBeforeAction: function() {
    Session.set("documentTitle", "UrbanRoulette - Home");
    this.next();
  }
});

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

/* old Route */
Router.map(function() {
  //   this.route('SMScardList', {
  //     path: '/',
  //     template: 'SMScardList'
  //         subscriptions: function(){
  //       if (typeof rouletteResultsId !== 'undefined')
  //         this.resultsSub = Meteor.subscribe('rouletteResults', rouletteResultsId);
  //     },
  //    data: function(){
  //     return {
  // //      ready: this.resultsSub.ready,
  //       };
  //     }

  //   });

  this.route('cardList', {
    path: '/roulette',
    template: 'cardList',
  });

  this.route('formDatabase', {
    path: '/formDatabase/:_id?',
    template: 'formDatabase',
    waitOn: function() {
      return [Meteor.subscribe('activitieswaiting'),
        Meteor.subscribe('singleActivity', this.params._id)
      ];
    },
    data: function() {
      return Activities.findOne({
        _id: this.params._id
      });
    },
  });

  this.route('database', {
    path: '/database',
    template: 'formDatabaseTable',
    waitOn: function() {
      return [Meteor.subscribe('activities'),
        Meteor.subscribe('cinemas'),
        Meteor.subscribe('movies')
      ];
    }
  });
});