Template.cardList.events({
	'click #click-button': function(e){
		var startDate = new Date();
		var resultsKeptSessionVar = Session.get('rouletteResults');
		Meteor.call('algorithm',startDate, /*resultsKeptSessionVar,*/ function(error, result) {
			if (error)
				console.log(error);
			else
				Session.set('rouletteResults', result);
		});	
/*		var rouletteResults = Session.get('rouletteResults');
		var rouletteResultsId = [];
		for (k=0; k < rouletteResults; k++){
			rouletteResultsId.push(rouletteResults[k]);
		}
		Meteor.subscribe('rouletteResults', rouletteResultsId);
*/		e.stopPropagation();
	}	
});

Template.cardList.helpers({
	activity: function(){
		return Session.get('rouletteResults');
	}
});
