Template.cardItem.events({
	'click .see-more': function(e){
		var index = this.index;
		if ($('#' + index + 'see-more').html() === "Voir plus..."){
			$('#' + index).css({"height":"auto"});
			$('#' + index + 'see-more').html('Masquer');
		}
		else {
			$('#' + index).css({"height":"40px"});
			$('#' + index + 'see-more').html('Voir plus...');
		}
	},
	'click .keep': function(e){
		var index = this.index;
		if($('#' + index + 'keep').hasClass('keep-selected')){
			var a = Session.get('resultsKept');
			    a = _.extend([], a); 
			var pos = 0; 
			for(i=0; i < a.length; i++){
				if (a[i].index === this.index)
					break;
				pos +=1;
			}
			a.splice(pos, 1);
		    Session.set('resultsKept', a);
		}
		else {
		if(Session.get('resultsKept')){
			var m = Session.get('resultsKept');
		    m = _.extend([], m); //Creates a new array
		    m.push(this);
		    Session.set('resultsKept', m);
		}
		else 
			Session.set('resultsKept', [this]);
		}
	}
});

Template.cardItem.helpers({
	keepSelected: function(){
		if(Session.get('resultsKept')){
			var array = Session.get('resultsKept');
			var check = false;
		    for (i = 0; i < array.length; i++) {
		        if (array[i].index === this.index) 
		            check = true;		        
		    }
			if (check)
				return 'keep-selected';
		}
	},
	control: function(){
		if(this.district === 99)
			return false;
		else
			return true;
	}
});