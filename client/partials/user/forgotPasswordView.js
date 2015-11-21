Template.forgotPassword.events({
  'submit form': function(event, template) {

    // Prevent the form to go to another page
    event.preventDefault();

    // Get email
    var emailVar = event.target.forgotEmail.value;

    // Use meteor native createUser function
    Accounts.forgotPassword({
      email: emailVar
    }, function(err) {

      // If there's an error form the BE
      if (err) {
        Alert(error.message, 'error');
      }

      // Else show success state
      else {
        Alert('Email Sent. Check your mailbox.', 'success');
      }
    });
  }
});