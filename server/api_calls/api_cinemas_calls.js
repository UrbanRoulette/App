Meteor.startup(function(){

/*
	var moviesinfos = HTTP.call('GET',"https://www.kimonolabs.com/api/2rxsr1c0?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI&kimmodify=1");
	results = moviesinfos.data;
	for(k=0;k<results.length;k++){
		Movies.insert(results[k]);
	}
*/
/*	var allocine = HTTP.call('GET',"https://www.kimonolabs.com/api/85zp3r2a?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI&kimmodify=1");
	results = allocine.data;
	for(k=0;k<results.length;k++){
		Cinemas.insert(results[k]);
	}


	var cinefil = HTTP.call('GET',"https://www.kimonolabs.com/api/drur6yui?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI&kimmodify=1");
	var results = cinefil.data;

	for(k=0; k < results.length;k++){
		if(Cinemas.find({key_name: results[k].key_name}).count() === 0){
			Cinemas.insert(results[k]);
		}
		else {
			Cinemas.update({key_name: results[k].key_name}, {$set: {metrostation: results[k].metrostation}});
		}
	}
*/
/*	
	Activities.remove({source: "Cinefil"});

	var activitycinema = HTTP.call('GET',"https://www.kimonolabs.com/api/cnfssnwo?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI");
	var movies = activitycinema.data.results.collection1;
	var seances = activitycinema.data.results.collection2;

//    console.log(movies.length);
//    console.log(seances.length);
    var date = new Date();
    date = new Date(date.getTime() + 120*60000);
    var day = weekday[date.getDay()];

    var get = HTTP.call('GET','https://www.kimonolabs.com/api/5eoh60o0?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI&kimmodify=1');
    var bestmovies = (get.data).bestmovies;  
    console.log(bestmovies);

    var speficitoTime_req = HTTP.call('GET',"https://www.kimonolabs.com/api/7dafs1pq?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI&kimmodify=1");        
    var speficitoTime_data = speficitoTime_req.data;

    for (k=0; k < movies.length; k++){

        var key_specific = (movies[k].specific).toLowerCase().replace(/ |-|'|:|,/g,'').replace(/é|è|ê/gi,'e').replace(/ô/gi,'o');
        if(bestmovies.indexOf(key_specific) === -1)
            continue;

        for (i=0; i < seances.length; i++){

            var doc;
            var cinema;
            var movie;

            var obj = {};
            obj.specific = movies[k].specific;
            obj.key_specific = key_specific;
            
            if (movies[k].url === seances[i].url){

                obj.name = seances[i].cinema.text;
                obj.key_name = (obj.name).toLowerCase().replace(/ |-|Cinéma| Le | Du | Au | à | La | et |'/gi,'').replace(/ô/,'o').replace(/é|è|ê/i,'e');
                if(typeof seances[i].hours === "string")
                    seances[i].hours = [seances[i].hours];
                if(seances[i].hours.length > 0 && seances[i].hours.indexOf("") === -1){
                    for (var l=0; l < (seances[i].hours).length; l++)
                        (seances[i].hours)[l] = (seances[i].hours)[l].replace(/:/,'');
                        obj[day] = seances[i].hours;
                    }
                else 
                    obj[day] = null;

                doc = Activities.findOne({$and: [{specific: obj.specific}, {name: obj.name}]});

                if(typeof doc !== 'undefined'){
                }    
                else if ((typeof doc === 'undefined') && obj[day] !== null){                             
//                if(obj[day] !== null){
                    movie = Movies.findOne({key_specific: obj.key_specific});
                    delete obj.key_specific;
                    if(typeof movie !== 'undefined'){
                        obj.description = movie.description;
                        obj.last = movie.last;
                        obj.image = movie.image;
                        obj.longUrl = movie.longUrl;
                        var link = HTTP.call('POST',
                        'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyAdjMwL0vrhXn00TKLGgfII6ET0sNsEa8E',{
                            data: {longUrl: obj.longUrl},
                            headers: {contentType: 'application/json; charset=utf-8',
                                        dataType: 'json'
                                    }
                                }   
                        );
                        obj.link = link.data.id;
                    }
                    else 
                        break;

                    cinema = Cinemas.findOne({key_name: obj.key_name});
                    delete obj.key_name;
                    if(typeof cinema !== 'undefined'){
                        obj.address = cinema.address;
                        obj.district = cinema.district;
                        obj.type = 'Cinéma/Film';
                        obj.metrostation = [];
                        obj.price = cinema.price;
                    }
                    else 
                        continue;

                    obj.source = "Cinefil";
                    obj.copies = 1;
                    obj.draws = 0;
                    obj.requiresun = false;
                    if(typeof obj.district === 'undefined' && typeof obj.address === 'undefined'){
                        obj.address = 'Adresse d\'essai 75010 PARIS';
                        obj.district = 10;
                    }                    
                    obj.index = Meteor.call('createIndex',obj.district,obj.type);
                    obj.submitted = new Date();
                    obj.specifictoTime = {};
                    var check = true;
                    for (var key in obj){
                        if(typeof obj[key] === 'undefined' && key !== "metrostration")
                            check = false;
                    }
                    if(check){
                        Activities.insert(obj, {validate: false});
                        console.log(obj.specific + ' - ' + obj.name);

                        for(k=0; k < (cinema.metrostation).length; k++){ 
                            if(obj.metrostation.indexOf(cinema.metrostation[k]) === -1)
                                obj.metrostation.push(cinema.metrostation[k]);
                        }
                        Activities.update({$and: [{name: obj.name},{specific: obj.specific}]},{$push: {metrostation: {$each: obj.metrostation}}});
                   }
                }
            }
        }
    }   
    console.log('Update DONE');
   */
});
