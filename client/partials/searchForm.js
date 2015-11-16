Template.searchForm.onRendered(function() {
  var self = this;
  this.autorun(function() {
    if (GoogleMaps.loaded()) {
      self.$('input[name="location"]').geocomplete({
        country: "FR",
        types: ["geocode"]
      });
    }
  });
});

Template.searchForm.helpers({
  searchValue: function() {
    return Session.get('currentSearch') ? Session.get('currentSearch') : "";
  }
});

Template.searchForm.events({

  // When submitting the form
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    var location = event.target.location.value;

    // If empty return false
    if (!location.length) return false;

    // Save search in session
    Session.set('currentSearch', location);

    // Go to search page
    Router.go('search', {
      keyword: location
    });

  },

  // When submitting the form
  'keydown input': function(event, template) {
    if (event.which == 13 && $('.pac-container:visible').length === 0) return template.$('form').submit();
  }
});