Template.activityItem.onCreated(function() {
  var canBeTruncated = this.data.description.length > 200;
  this.state = new ReactiveDict();
  this.state.set('canBeTruncated', canBeTruncated);
  this.state.set('truncated', true);
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
  }
});

Template.activityItem.events({
  'click .activity-item__description__expand': function(event, template) {
    event.preventDefault();
    template.state.set('truncated', !Template.instance().state.get('truncated'));
    this.event.target.text(Template.instance().state.get('truncated') ? "Show less" : "Show more");
  }
});