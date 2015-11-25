// When the template is being rendered
Template.resetPassword.onCreated(function() {

  // If there's an token saved (got from URL)
  if (Accounts._resetPasswordToken) {

    // Save that token in the Session
    Session.set('resetPassword', Accounts._resetPasswordToken);
  }
});

// Helper, used in template to show or not the form
Template.resetPassword.helpers({
  resetPassword: function() {

    // If there's a tokenset
    return Session.get('resetPassword');
  }
});

Template.resetPassword.events({
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    // Get password and confirm password
    var password = event.target.password.value;
    var passwordConfirm = event.target.passwordConfirm.value;

    // Some basic validation
    if (password.length == 0) return Alert('Enter a new password', 'error');
    if (password != passwordConfirm) return Alert('password don\'t match', 'error');

    // Use native Meteor function
    Accounts.resetPassword(Session.get('resetPassword'), password, function(error) {

      // If there's an error form the BE
      if (error) {
        Alert(error.message, 'error');
      }

      // Else show success state & Empty token
      else {
        Alert('Your password has been changed. Welcome back!', 'success');
        Session.set('resetPassword', null);
      }
    });
  }
});