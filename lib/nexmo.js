Router.map(function() {
    this.route('sendSMS', {
        path: '/send_roulette',
        where: 'server',
        action: function() {

            Nexmo.initialize('3c380619', '390ebd8a', 'http OR https', 'DEBUG (true)');

            this.response.setHeader('Access-Control-Allow-Origin', '*' );

            var query = this.request.query;
            var recipient = query.msisdn;

            var doc = Draws.findOne({recipient: recipient}, {sort: {date: -1, _id: -1}});
            console.log("Query : " + query);
            console.log("Query stringified : " + JSON.stringify(query));
            var text = query.text.toLowerCase();
//            var text = '';          
            //Regexp
            pattroulette = /^Roulette {0,1}[0-9]{0,2} {0,1}[a-z]{0,9}$/i;
            pattbook = /^Réserver restaurant$/i;

            var maxRoulette = 3;
            var checkcount = false;
            var textmessage = '';
            var date = new Date();
            var roulettecount = 1;
            var timezoneOffset = -60;

            if(typeof doc !== 'undefined'){
                var previous = new Date(doc.date).setHours(0,0,0,0);
                var current = (new Date(date.getTime() - timezoneOffset*60000)).setHours(0,0,0,0);

                if (previous === current && doc.roulettecount < maxRoulette) {
                    checkcount = true;
                    roulettecount = doc.roulettecount + 1;
                }
                else if (previous === current && doc.roulettecount === maxRoulette){

                        textmessage = 'Le nombre de roulettes est limité à ' + maxRoulette + ' par jour !\nEmprunte le portable d\'un ami pour continuer de la faire tourner !';
                        Nexmo.sendTextMessage('Roulette',recipient,textmessage);
                        Draws.update({_id: doc._id}, {$set: {roulettecount: maxRoulette + 1}});

                }
                else if (previous !== current)
                    checkcount = true;
            }
            else
                checkcount = true;
                        

            if(pattroulette.test(text) && checkcount){

                var text_array = text.split(" ");
                var length = text_array.length;
                var profile = ["gratuit", "cheap", "exterieur", "curieux", "couple", "solo", "potes", "prestige"];
                var district = 0;  

                var checktime = true;

                if(length === 3){
                    district = parseInt(text_array[1]);
                    profile = [text_array[2]];                    
                }
                else if (length === 2){
                    district = parseInt(text_array[1]);
                    if(isNaN(district)){
                        profile = [text_array[1]];
                        district = 0;
                    }
                }

                if (districts.indexOf(district) > -1 && profiles.indexOf(profile[0]) > -1){

                    var center = district_coordinates[district];
                    var radius = (district !== 0) ? 1 / 3963.2 : 10 / 3963.2;

                    var rouletteResults = Meteor.call('get_activities_results',center,radius,date,profile,timezoneOffset);

                    var resultsId = [];
                    for(k=0;k<rouletteResults.length;k++){
                        resultsId.push(rouletteResults[k]._id);
                    }

                    textmessage = 'Votre tirage : ' + '\n';

                    var activitiesString = '';
                    for (k=0; k < rouletteResults.length; k++)
                        activitiesString += Meteor.call('createString',rouletteResults[k]);
                    textmessage += activitiesString;
                    
                    if(district > 0)
                        textmessage += '\n"Roulette ' + district +'" au 06 44 63 10 00 pour un autre tirage !';
                    else
                        textmessage += '\n"Roulette" au 06 44 63 10 00 pour un autre tirage !';

                    var draw = {};

                    draw.district = district;
                    draw.recipient = recipient;
                    draw.bookRestaurant = false;
                    draw.roulettecount = roulettecount;
                    draw.date = date;
                    draw.resultsId = resultsId;

                    Draws.insert(draw);
                    
                    for (k=0; k < resultsId.length;k++){
                        Activities.update({_id: resultsId[k]}, {$inc: {draws: 1}});
                    }                                  
                }           
            }

            else if (pattbook.test(text)){
                
                if(doc.bookRestaurant === false){

                    var restaurant = doc.restaurant;

                    if((typeof restaurant !== 'undefined') && restaurant !== null){
                        textmessage = restaurant.name + ' - ' + restaurant.district + 'e' + '\n';
                        textmessage += 'Réservation au ' + restaurant.contact;
                        Nexmo.sendTextMessage('Roulette',recipient,textmessage);
                        Draws.update({_id: doc._id}, {$set: {bookRestaurant: true}});
                    }
                }
            }

            if(pattroulette.test(text) && checkcount)
                Nexmo.sendTextMessage('Roulette',recipient,textmessage);

            this.response.statusCode = 200; 
            this.response.end();     
        }
    });
});
