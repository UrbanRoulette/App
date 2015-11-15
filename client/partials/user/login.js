Template.login.events({
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    // Emptying that error message in case of previous failture
    template.$(".alert").text("").removeClass("error");

    // Getting email / Password
    var emailVar = event.target.loginEmail.value;
    var passwordVar = event.target.loginPassword.value;

    // Use meteor native login function
    Meteor.loginWithPassword(emailVar, passwordVar, function(error) {

      // If there's an error form the BE
      if (error) {

        // We set the text of that error with the error.message
        return template.$(".alert").addClass("error").text(error.message);
      }
    });
  }
});