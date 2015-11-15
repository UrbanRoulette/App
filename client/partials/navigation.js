Template.navigation.events({
  'click .logout': function(event) {

    // Prevent link default behavior
    event.preventDefault();

    // User meteor native logout
    Meteor.logout();
  }
});