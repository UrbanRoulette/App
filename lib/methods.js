Meteor.methods({

	createIndex: function (district,type){

		check(district,Number);
		check(type,String);

		var district_str = (district < 10) ? '0' + district : district.toString();

		var typeNb = types.indexOf(type);
		var typeNb_str = (typeNb < 10) ? '0' + typeNb : typeNb.toString();

		var number = Activities.find({$and: [{district: district}, {type: type}]}).count();

		var index = parseInt((number + 1).toString() + typeNb_str + district_str);

		return index;
	},

	updateIndex: function(id,newdistrict,newtype){

		check(id,String);
		check(newdistrict,Number);
		check(newtype,String);

		var index = Meteor.call('createIndex',newdistrict,newtype);
		Activities.update({_id: id}, {$set: {district: newdistrict, type: newtype, index: index}});
	},

	update_other_Indexes: function(district,type,number){

		check(district,Number);
		check(type,String);
		check(number,Number);

		Activities.find({$and: [{district: district},{type: type}]}).forEach(function(doc){
			var fixpart = (doc.index).toString().slice(-4);
			var nb = parseInt((doc.index).toString().slice(0,(doc.index).toString().length - 4));
			if(nb > number){
				var newIndex = parseInt((nb - 1) + fixpart); 
				Activities.update({_id: doc._id}, {$set: {index: newIndex}});
			}
		});
	},

	createStars: function(item){

		check(item,String);
		var probability = [];
		var stars = '';
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
        var random = Math.floor(Math.random()*size);
        for(i=1;i<=probability[random];i++)
       		stars += item;

       	return stars;
	},

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
