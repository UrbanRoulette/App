Template.cardList.events({
	'click #click-button': function(e){
		var district = Session.get('district');
		var date = new Date();
		var timezoneOffset = date.getTimezoneOffset();	
		var resultsKeptSessionVar = Session.get('resultsKept');

		Meteor.apply('algorithm',[district,date,timezoneOffset],true,function(error, result) {
			if (error)
				console.log(error);
			else {
				Session.set('rouletteResults', result.rouletteResults);
				console.log(result.benchmark + ' ms');
				console.log(result.message);
				var rouletteResults = Session.get('rouletteResults');
				rouletteResultsId = [];
				for (k=0; k < rouletteResults.length; k++){
					rouletteResultsId.push(rouletteResults[k]._id);
				}
				e.stopPropagation();
			}
		});	

	},
});

Template.cardList.helpers({
	activity: function(){
		return Session.get('rouletteResults');
	},
	
	district: function(){
		return [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
	},

	priceInterval: function(){
		if(Session.get('rouletteResults')){
			var rouletteResults = Session.get('rouletteResults');
			var p = Meteor.call('getPriceInterval',rouletteResults);
			if(p.minPrice !== p.maxPrice)
				priceInterval =  p.minPrice + '€' + ' - ' + p.maxPrice + '€';
			else
				priceInterval = minPrice + '€ environ';

			return priceInterval;
		}
	},

	stars: function(){
		if(Session.get('rouletteResults')){ //So that helpers is reactive
			var stars = Meteor.call('createStar','✪');
			return stars;
		}
	}
});
