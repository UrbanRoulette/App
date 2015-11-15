Template.signup.events({
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    // Emptying that error message in case of previous failture
    template.$(".alert").text("").removeClass("error");

    // Get name / email / password
    var nameVar = event.target.registerName.value;
    var emailVar = event.target.registerEmail.value;
    var passwordVar = event.target.registerPassword.value;

    // Use meteor native createUser function
    Accounts.createUser({
      email: emailVar,
      password: passwordVar,
      profile: {
        name: nameVar
      }
    }, function(error) {

      // If there's an error form the BE
      if (error) {

        // We set the text of that error with the error.message
        return template.$(".alert").addClass("error").text(error.message);
      }
    });
  }
});