Template.searchForm.events({

  // When submitting the form
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    var location = event.target.location.value;

    // IF valid
    Router.go('search', {
      keyword: location
    });

    console.log(location);
  }
});