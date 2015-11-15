// Change URL for reset email
Meteor.startup(function() {
  return Accounts.urls.resetPassword = function(token) {
    return Meteor.absoluteUrl('reset/' + token);
  };
});