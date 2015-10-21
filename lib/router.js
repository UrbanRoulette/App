Router.configure({
  loadingTemplate: 'loading',
});


// Landing page
Router.route('/', {
  name: 'home',
  template: 'landingPage',
  layoutTemplate: 'mainLayout'
});

// Landing page
Router.route('/search/:keyword', {
  name: 'search',
  template: 'searchView',
  layoutTemplate: 'mainLayout',
  data: function() {
    return this.params.keyword;
  }
});


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