Template.searchView.helpers({
  isLoading: function() {
    return Session.get('loading')
  }
});