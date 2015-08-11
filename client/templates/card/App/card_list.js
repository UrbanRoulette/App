Template.cardList.events({
	'click #click-button': function(e){
		var timezoneOffset = (new Date()).getTimezoneOffset();
		var district = Session.get('district');
		var resultsKeptSessionVar = Session.get('resultsKept');
//		rouletteResults = Meteor.call('algorithm', startDate, district);
		Meteor.apply('algorithm',[district, timezoneOffset],true,function(error, result) {
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
			var results = Session.get('rouletteResults');
			var totalPrice = 0;
			for (k=0; k < results.length; k++){
				if(results[k].price !== 'undefined' && results[k].price !== null){
					var str = (results[k].price).replace(/,/,'.');
					if(str.indexOf('.') > -1 && str.slice(-1) === '0')
						str = str.slice(0, -1);
					activityPrice = Number(str); //Will not work if string ends with a 0
					totalPrice += activityPrice; 
				}
			}
			var deviation = 0.2;
			var minPrice = Math.round(totalPrice*(1-deviation));
			var maxPrice = Math.round(totalPrice*(1+deviation));
			return minPrice + '-' + maxPrice;
		}
	},
	stars: function(){
		if(Session.get('rouletteResults')){ //So that helpers is reactive
			var probability = [];
			size = 10;
			factor = size/10;
			for(k=0;k<1*size;k++){
				if(k < 1*factor)
					probability.push(1);
				else if(k >= 1*factor && k < 3*factor)
					probability.push(2);
				else if(k >= 3*factor && k < 6*factor)
					probability.push(3);
				else if(k >= 6*factor && k < 8*factor)
					probability.push(4);
				else if(k >= 8*factor && k < 10*factor)
					probability.push(5);
			}
			random = Math.floor(Math.random()*size);
			stars = '';
			for(i=1;i<=probability[random];i++){
				stars += '✪';
			} 
			return stars;
		}
	}
});
