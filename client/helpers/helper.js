Helpers = {
  activity: {
    isEmpty: function() {
      return (typeof(Session.get('activities_results')) === 'undefined' || Session.get('activities_results').length === 0)
    }
  }
}