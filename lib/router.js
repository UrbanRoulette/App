/*Router.configure ({
	loadingTemplate:'loading',
  	waitOn: function() {
    return Meteor.subscribe('activities'); 
  }
});
*/

Router.route('/', function() {
  this.render('cardList');
},  {
  name: 'cardList'
});

Router.route('/formDatabase', function() {
  this.render('formDatabase');
},  {
  name: 'formDatabase'
});

Router.route('/database', function() {
  this.render('formDatabaseTable');
},  {
  name: 'database'
});
