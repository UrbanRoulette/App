Template.activityItem.onCreated(function() {
  var canBeTruncated = this.data.description.length > 200;
  this.state = new ReactiveDict();
  this.state.set('canBeTruncated', canBeTruncated);
  this.state.set('truncated', true);
  convert_date_to_readable_string = function(date){
    date = new Date(date);
    var h = date.getHours();
    var m = date.getMinutes();
    var hh = (h>=10) ? '' : '0';
    var mm = (m>=10) ? 'h' : 'h0';
    var readable_string = hh + h.toString() + mm + m.toString();    
    return readable_string;
  };
});

Template.activityItem.helpers({
  description: function() {
    var description = this.description;
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
  time_start: function(){
    var start_string = convert_date_to_readable_string(this.start_date);
    console.log(start_string);
    return start_string;
  },
  time_end: function(){
    var end_string = convert_date_to_readable_string(this.end_date);
    return end_string;
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