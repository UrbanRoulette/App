Template.activityList.onCreated(function() {
  var self = this;
  if (!Session.get('activities_results')) return callServer();

  self.autorun(function() {
    if (Session.get('currentSearch')) {
      callServer();
    }
  });
});

Template.activityList.onRendered(function() {
  var self = this;
  self.autorun(function() {
    self.$('.activity-list__activity').removeClass('activity-list__activity--hovered');
    if (_.isNumber(Session.get('pin_hovered_id'))) {
      self.$('.activity-list__activity:eq(' + Session.get('pin_hovered_id') + ')').addClass('activity-list__activity--hovered');
    }
  });
});

Template.activityList.events({
  'click .activity-list__retry': function() {
    Session.set("activities_switched", []);
    callServer();
  },
  'mouseenter .activity-list__activity': function(event) {
    Session.set('activity_hovered_index', parseInt(event.target.dataset.index));
  },
  'mouseleave .activity-list__activity': function() {
    Session.set('activity_hovered_index', false);
  }
});

Template.activityList.helpers({
  activities: function() {
    return Session.get('activities_results');
  },
  showEmpty: function(){
    return Helpers.activity.isEmpty() || Session.get('loading');
  },
  getEmptyTitle: function(){
    if(Session.get('loading')) return "Loading";
    if(Helpers.activity.isEmpty()) return "No result";
  },
  getEmptyText: function(){
    if(Session.get('loading')) return "We're loading your result, hang tight!";
    if(Helpers.activity.isEmpty()) return "Sorry, it seems like there is no activity to display for this location. Try to search for another address!";
  },
  isEmpty: function() {
    return Helpers.activity.isEmpty();
  },
  isLoading: function() {
    return Session.get('loading')
  }
});