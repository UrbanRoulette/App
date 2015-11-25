Template.profile.events({
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    // Get name / password / new password
    var nameVar = event.target.profileName.value;
    var oldPasswordVar = event.target.profileOldPassword.value;
    var newPasswordVar = event.target.profileNewPassword.value;

    // Quick check if new/ oldpassword are not empty (.length!=0)
    if (oldPasswordVar.length != 0 && newPasswordVar.length != 0) {

      // Use meteor native changePassword function
      Accounts.changePassword(oldPasswordVar, newPasswordVar, function(error)  {

        // If there's an error form the BE
        if (error) {

          // We set the text of that error with the error.message
          Alert(error.message, 'error');

        } else {

          // We set the text of that error with the erro  r.message
          Alert('password updated', 'success');
        }
      });
    }

    // If name in input is not the same as current username
    if (nameVar != Meteor.user().profile.name) {

      // User meteor Update
      Meteor.users.update(Meteor.userId(), {
        $set: {
          'profile.name': nameVar
        }
      }, function(error)  {

        // If there's an error form the BE
        if (error) {

          // We set the text of that error with the error.message
          Alert(error.message, 'error');

        } else {

          // We set the text of that error with the error.message
          Alert('Profile updated!', 'success');
        }
      });

    }
  }
});