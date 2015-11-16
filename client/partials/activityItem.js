Template.activityItem.onCreated(function() {
  var canBeTruncated = this.data.description.length > 200;
  this.state = new ReactiveDict();
  this.state.set('canBeTruncated', canBeTruncated);
  this.state.set('truncated', true);
  
  convert_date_to_readable_string = function(date){
      var h = date.getHours();
      var m = date.getMinutes();
      var hh = (h>=10) ? '' : '0';
      var mm = (m>=10) ? ':' : ':0';
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
    return convert_date_to_readable_string(this.start_date);
  },
  time_end: function(){
    return convert_date_to_readable_string(this.end_date);
  },
});

Template.activityItem.events({
  'click .activity-item__description__expand': function(event, template) {
    event.preventDefault();
    template.state.set('truncated', !Template.instance().state.get('truncated'));
    this.event.target.text(Template.instance().state.get('truncated') ? "Show less" : "Show more");
  }
});