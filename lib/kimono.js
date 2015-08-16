//Router = new Iron.Router();
/*
Router.configureBodyParsers = function() {
    Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
        extended: true,
        limit: '500mb'
    }), {where: 'server'});
};
*/

Router.map(function() {

    this.route('seances', {
        path: '/seances',
        where: 'server',
        action: function() {

            this.response.setHeader('Access-Control-Allow-Origin', '*' );
            
            Activities.remove({source: "Cinefil"});

            data = this.request.body;
            var movies = data.results.collection1;
            var seances =  data.results.collection2;

            var date = new Date();
            date = new Date(date.getTime() + 120*60000);
            var day = weekday[date.getDay()];

            var get = HTTP.call('GET','https://www.kimonolabs.com/api/5eoh60o0?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI&kimmodify=1');
            var bestmovies = (get.data).bestmovies;

            var moviesinfos = HTTP.call('GET',"https://www.kimonolabs.com/api/2rxsr1c0?apikey=dSehtgBmnjge0YgdIhUupy2VDy6rWWJI&kimmodify=1");
            var results = moviesinfos.data;
            for(k=0;k < results.length;k++){
                if(Activities.find({specific: results[k].specific}).count() === 0)
                    Movies.insert(results[k]);
            }    

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
        /*                    console.log('Found an existing doc');
                            var setModifier = { $set: {} };
                            setModifier.$set[day] = obj[day];
                            Activities.update({_id: doc._id}, setModifier, {validate: false});
        */    //              Activities.update({_id: doc._id}, {$set: {specifictoTime: obj.specifictoTime}}, {validate: false});                    
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
                            obj.index = Meteor.call('createIndex',obj.district,obj.type);
                            obj.submitted = new Date();
                            obj.specifictoTime = {};
                            var check = true;
                            for (var key in obj){
                                if(typeof obj[key] === 'undefined' && key !== "metrostration")
                                    check = false;
                            }
                            if(check){
                                for(j=0;j < speficitoTime_data.length; j++){
                                    var det = speficitoTime_data[k];
                                    if(obj.name === det.name && obj.specific === det.specific){
                                        obj.specifictoTime = {};
                                        for(var time in det.specifictoTime){
                                            obj.specifictoTime[time] = det.specifictoTime[time];
                                        }
                                    }
                                }
                                Activities.insert(obj, {validate: false});
                                console.log(obj.specific + ' - ' + obj.name);
                                for(k=0; k < (cinema.metrostation).length; k++){ 
                                    if(obj.metrostation.indexOf(cinema.metrostation[k]) === -1)
                                        obj.metrostation.push(cinema.metrostation[k]);
                                }
                                Activities.update({$and: [{name: obj.name},{specific: obj.specific}]},{$push: {metrostation: {$each: obj.metrostation}}});

/*                              for(j=0;j < speficitoTime_data.length; j++){
                                    var det = speficitoTime_data[k];
                                    if(obj.name === det.name && obj.specific === det.specific){
                                        var update_query = {};
                                        for(var time in det.specifictoTime){
                                            update_query[time] = det.specifictoTime[time];
                                        }
                                        Activities.update({$and: [{name: obj.name},{specific: obj.specific}]},{$set: {specifictoTime: obj.specifictoTime}});
                                        break;
                                    }
                                }                                        
*/                            
                            }
                        }
                    }
                }
            }
            this.response.statusCode = 200;
            this.response.end('Success');
        }
    });
});

/*
Router.route('/cinefilmovies', function(){
	this.response.setHeader('Access-Control-Allow-Origin', '*' );
	console.log(this.request.body);
	this.response.statusCode = 200;
	this.response.end();
}, {where: 'server'});
*/