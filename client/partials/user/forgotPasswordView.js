Template.forgotPassword.events({
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    // Emptying that error message in case of previous failture
    template.$(".alert").text("").removeClass("error");

    // Get email
    var emailVar = event.target.forgotEmail.value;

    // Use meteor native createUser function
    Accounts.forgotPassword({
      email: emailVar
    }, function(err) {

      // If there's an error form the BE
      if (err) {
        template.$(".alert").addClass("error").text(error.message);
      }

      // Else show success state
      else {
        template.$(".alert").addClass("success").text('Email Sent. Check your mailbox.');
      }
    });
  }
});