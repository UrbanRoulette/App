Meteor.methods({
	getPriceInterval: function(rouletteResults){

		check(rouletteResults,[Object]);

	    var totalPrice = 0;
	    
	    for (k=0; k < rouletteResults.length; k++){

	        var obj = rouletteResults[k];

	        if(obj.price !== 'undefined' && obj.price !== null){
	            var str = (obj.price).replace(/,/,'.');

	            if(str.indexOf('.') > -1 && str.slice(-1) === '0')
	            str = str.slice(0, -1);

	                activityPrice = Number(str);
	                totalPrice += activityPrice;  
	        }
	    }

	    var deviation = 0.2;
	    var minPrice = Math.round(totalPrice*(1-deviation));
	    var maxPrice = Math.round(totalPrice*(1+deviation));

	    return {minPrice: minPrice,
	    		maxPrice: maxPrice
	    		};
	}

});
