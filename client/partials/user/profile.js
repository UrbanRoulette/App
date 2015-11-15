Template.profile.events({
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    // Emptying that error message in case of previous failture
    template.$(".alert").text("").removeClass("error");
    $(".error").text("");

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
          template.$(".alert").addClass("error").text(error.message);
        } else {

          // We set the text of that error with the error.message
          template.$(".alert").addClass("success").text("password updated!");
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
          template.$(".alert").addClass("error").text(error.message);

        } else {

          // We set the text of that error with the error.message
          template.$(".alert").addClass("success").text(template.$(".alert").text() + "Profile updated!");
        }
      });

    }
  }
});