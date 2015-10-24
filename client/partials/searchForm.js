Template.searchForm.onRendered(function() {
  var self = this;
  this.autorun(function() {
    if (GoogleMaps.loaded()) {
      self.$('input[name="location"]').geocomplete();
    }
  });
});

Template.searchForm.helpers({
  searchValue: function() {
    return Session.get('currentSearch') ? Session.get('currentSearch') : "";
  }
})

Template.searchForm.events({

  // When submitting the form
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    var location = event.target.location.value;

    Session.set('currentSearch', location);

    // IF valid
    Router.go('search', {
      keyword: location
    });

  },

  // When submitting the form
  'keydown input': function(event, template) {
    if (event.which == 13 && $('.pac-container:visible').length == 0) return template.$('form').submit();
  }
});