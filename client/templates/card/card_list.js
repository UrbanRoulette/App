Template.cardList.events({
	'click #click-button': function(e){
		algorithm();
		e.stopPropagation();
	}	
});

Template.cardList.helpers({
	activity: function(){
		return Session.get('rouletteResults');
	}
});