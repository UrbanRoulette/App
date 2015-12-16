Template.activityItem.onCreated(function() {
  var canBeTruncated = this.data.main.description.length > 200;

//   convert_date_to_readable_string = function(date){
// //    date = new Date(date);
//     console.log("Date ouverture/fermeture activite : ");
//     console.log(date);
//     var h = date.getHours();
//     console.log("Hours" + h);
//     var m = date.getMinutes();
//     var hh = (h>=10) ? '' : '0';
//     var mm = (m>=10) ? 'h' : 'h0';
//     var readable_string = hh + h.toString() + mm + m.toString();    
//     return readable_string;
//   };

  this.locked = typeof(this.locked) == 'undefined' ? false : this.locked;
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
    var h = this.start_hour;
    var m = this.start_minutes;
    var hh = (h>=10) ? '' : '0';
    var mm = (m>=10) ? 'h' : 'h0';
    var readable_string = hh + h.toString() + mm + m.toString();    
    return readable_string;
//      return convert_date_to_readable_string(this.start_date);
//    return moment(this.start_date).format('HH:mm');
  },
  time_end: function() {
    var h = this.end_hour;
    var m = this.end_minutes;
    var hh = (h>=10) ? '' : '0';
    var mm = (m>=10) ? 'h' : 'h0';
    var readable_string = hh + h.toString() + mm + m.toString();    
    return readable_string;
//      return convert_date_to_readable_string(this.end_date);
//    return moment(this.end_date).format('HH:mm');
  },
});

Template.activityItem.events({
  'click .activity-item__description__expand': function(event, template) {
    event.preventDefault();
    template.state.set('truncated', !Template.instance().state.get('truncated'));
    template.$('.activity-item__description__expand').text(Template.instance().state.get('truncated') ? "Show less" : "Show more");
  },
  'click .activity-item__timeline__lock': function(event, template){
    var self = this;
    var activities_locked = Session.get('activities_locked');

    if(self.locked) {
      activities_locked = _.without(activities_locked, _.findWhere(activities_locked, {_id: self._id}));
    } else {
      activities_locked.push(self);
    }
    self.locked = !self.locked;
    template.state.set('isLocked',  self.locked);
    Session.set('activities_locked', activities_locked);
  },
  'click .activity-item__timeline__switch': function(event, template){
    var self = this;
    if(self.locked){
      alert("Vous devez unlocker une activité avant de la switcher !");
    }
    else{
      var activities_switched = typeof(Session.get('activities_switched')) == 'undefined' ? [] : Session.get('activities_switched');
      activities_switched.push(this._id);
      Session.set('activities_switched', activities_switched);
      var activities_results = Session.get('activities_results');
      var index = _.indexOf(activities_results, _.findWhere(activities_results, {_id: self._id}));
      //Recording locations
      if(index > 0) self.previous_coord = activities_results[index-1].index.coordinates;
      if(index < activities_results.length - 1) self.next_coord = activities_results[index+1].index.coordinates; 
      self.initial_coord = activities_results[0].index.coordinates;

      var radius = 10 / 3963.192; //Converts miles into radians. Should be divided by 6378.137 for kilometers
      Meteor.apply('switch_activity', [self,activities_switched,Session.get("weather"),radius], true, function(error, result) {
        if (error)
          console.log(error);
        else {
          if(typeof result === "object"){
            activities_results.splice(index,1,result);
            Session.set('activities_results',activities_results);
          }
          else alert(result);
        }
      });
    }
  },
});