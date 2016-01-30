Template.searchForm.onRendered(function() {
  var self = this;
  this.autorun(function() {
    if (GoogleMaps.loaded()) {
      self.$('input[name="location"]').geocomplete({
        country: "FR",
        types: ["geocode"]
      });
    }
    if(self.$('input[name="location"]').val().length > 0) {
      self.$('.input-clear').show();
    } else {
      self.$('.input-clear').hide();
    }
  });

});

Template.searchForm.helpers({
  searchValue: function() {
    return Session.get('currentSearch') ? Session.get('currentSearch') : "";
  },
  isLoading: function() {
    return Session.get('loading');
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

  // Show/hide input cleaner
  'input input, focus input': function(event, template) {
    if(event.currentTarget.value.length > 0) {
      template.$('.input-clear').show();
    } else {
      template.$('.input-clear').hide();
    }
  },

  'click .input-clear': function(event, template) {
    event.preventDefault();
    template.$('input[name="location"]').val('');
    template.$('.input-clear').hide();
  },

  // When submitting the form
  'keydown input': function(event, template) {
    if (event.which == 13 && $('.pac-container:visible').length === 0) return template.$('form').submit();
  }
});