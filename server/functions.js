Meteor.startup(function(){

	createString = function(obj){

        var carditem = '\n';
        carditem += obj.startString + "-" + obj.endString + " : " + obj.specific + " - " + obj.name;
        carditem = (obj.district !== 99) ? (carditem + ' - ' + obj.district +'e') : carditem;
        carditem += '\n';
        carditem = (obj.metrostation !== null) ? (carditem + 'Métro : ' + obj.metrostation + '\n') : carditem;
        carditem += '=>' + obj.link;
        carditem += '\n';

     	return carditem;
	};

});