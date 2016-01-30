Template.activityItem.onCreated(function() {
  var self = this;
  var canBeTruncated = this.data.main.description.length > 200;
  this.locked = typeof(this.data.locked) == 'undefined' ? false : this.data.locked;
  this.state = new ReactiveDict();
  this.state.set('canBeTruncated', canBeTruncated);
  this.state.set('truncated', true);
  this.state.set('isLocked', this.locked);
});

Template.activityItem.helpers({
  description: function() {
    var description = this.main.description;
    if (Template.instance().state.get('truncated') && description.length > 200) {
      return description.substring(0, 190) + "...";
    } else {
      return description;
    }
  },
  isTruncated: function()  {
    return Template.instance().state.get('truncated');
  },
  isLocked: function(){
    return Template.instance().state.get('isLocked');
  },
  canBeTruncated: function()  {
    return Template.instance().state.get('canBeTruncated');
  },
  time_start: function() {
    return moment(this.start_date).format('HH:mm');
  },
  time_end: function() {
    return moment(this.end_date).format('HH:mm');
  },
  discovery: function(){
    var results_length = Session.get("activities_results").length;
    var discoveries = Session.get('discoveries');
    if(typeof discoveries !== "undefined")
      return discoveries[this.rank];
  },
  showSwitch: function() {
    return !Template.instance().state.get('isLocked');
  },
  showDelete: function() {
    return !Template.instance().state.get('isLocked');
  },
});

Template.activityItem.events({
  'click .activity-item__description__expand': function(event, template) {
    event.preventDefault();
    template.state.set('truncated', !Template.instance().state.get('truncated'));
    template.$('.activity-item__description__expand').text(Template.instance().state.get('truncated') ? "Show less" : "Show more");
  },
  'click .activity-item__timeline__lock': function(event, template){
    event.preventDefault();
    var self = this;
    var activities_locked = Session.get('activities_locked');

    self.locked = !self.locked;
    if(!self.locked) {
      activities_locked = _.without(activities_locked, _.findWhere(activities_locked, {_id: self._id}));
    } else {
      activities_locked.push(self);
    }
    template.state.set('isLocked',  self.locked);
    Session.set('activities_locked', activities_locked);
  },
  'click .activity-item__timeline__switch': function(event, template){
    event.preventDefault();
    switchActivity(this);
  },
  'click .activity-item__timeline__delete': function(event, template){
    event.preventDefault();
    var confirmText = "Supprimer cette activité évitera qu'elle ressorte au cours de prochains tirages de votre session.";
    if(confirmText) removeActivity(this);
  }
});