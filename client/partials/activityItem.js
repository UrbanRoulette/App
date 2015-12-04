Template.activityItem.onCreated(function() {
  var canBeTruncated = this.data.main.description.length > 200;
  this.state = new ReactiveDict();
  this.state.set('canBeTruncated', canBeTruncated);
  this.state.set('truncated', true);
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
  canBeTruncated: function()  {
    return Template.instance().state.get('canBeTruncated');
  },
  time_start: function() {
    return moment(this.start_date).format('HH:mm');
  },
  time_end: function() {
    return moment(this.end_date).format('HH:mm');
  },
});

Template.activityItem.events({
  'click .activity-item__description__expand': function(event, template) {
    event.preventDefault();
    template.state.set('truncated', !Template.instance().state.get('truncated'));
    this.event.target.text(Template.instance().state.get('truncated') ? "Show less" : "Show more");
  },
  'click .activity-item__timeline': function(){
    var activities_locked = Session.get('activities_locked');
    var is_already_locked = false;
    var index;
    for(k=0;k<activities_locked.length;k++){
      if(activities_locked[k]._id === this._id){ 
          is_already_locked = true;
          index = k;
      }    
    }
    if(is_already_locked) activities_locked.splice(index,1);
    else {
      var activity = this;
      activity.locked = true;
      activities_locked.push(activity);
    }
    Session.set('activities_locked', activities_locked);
  }
});