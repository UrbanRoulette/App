Template.searchForm.onRendered(function() {
  this.autorun(function() {
    if (GoogleMaps.loaded()) {
      $("input").geocomplete();
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

  }
});