/*
Router.configureBodyParsers = function() {
    Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
        extended: true,
        limit: '20mb'
    }), {where: 'server'});
};
*/  

Router.map(function() {
    this.route('sendSMS', {
        path: '/send_roulette',
        where: 'server',
        action: function() {

            Nexmo.initialize('3c380619', '390ebd8a', 'http OR https', 'DEBUG (true)');

            this.response.setHeader('Access-Control-Allow-Origin', '*' );

            var query = this.request.query;
            var recipient = query.msisdn;

            var doc = Draws.findOne({recipient: recipient}, {sort: {startDate: -1, _id: -1}});

            var text = query.text.toLowerCase();            
            //Regexp
            pattroulette = /^Roulette {0,1}[0-9]{0,2} {0,1}[a-z]{0,8} {0,1}[a-z]{0,5}$/i;
            pattbook = /^Réserver restaurant$/i;

            var maxRoulette = 3;
            var checkcount = false;
            var textmessage = '';
            var date = new Date();
            var roulettecount = 1;
            var timezoneOffset = -120;

            if(typeof doc !== 'undefined'){
                var previous = new Date(doc.startDate).setHours(0,0,0,0);
                var current = (new Date(date.getTime() - timezoneOffset*60000)).setHours(0,0,0,0);

                if (previous === current && doc.roulettecount < maxRoulette) {
                    checkcount = true;
                    roulettecount = doc.roulettecount + 1;
                }
                else if (previous === current && doc.roulettecount === maxRoulette){

                        textmessage = 'Le nombre de roulettes est limité à ' + maxRoulette + ' par jour !\nEmprunte le portable d\'un ami pour continuer de la faire tourner !';
                        Nexmo.sendTextMessage('33644631000',recipient,textmessage);
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
                var district = (length === 2 || length === 4) ? parseInt(text_array[1]) : 0;
                var checktime = true;

                if(length > 2){

                    checktime = false;
                    var jour = (length === 3) ? text_array[1] : text_array[2];
                    var moment = (length === 3) ? text_array[2] : text_array[3];

                    var ind_jour = jours_semaine.indexOf(jour) + 1;
                    var ind_moment = day_moment.indexOf(moment);

                    if (ind_jour > 0 && ind_moment > -1){
                        checktime = true;
                        var day = date.getDay() + 1;
                        var hour = date.getHours();
                        
                        var lag = (day > ind_jour) ? (7 - ind_jour) + day : ind_jour - day;
                        if(lag === 0)
                            lag = (ind_hour > hour) ? 0 : 7;

                        date = date.setHours(day_moment_hours[ind_moment],0,0,0);
                        date = new Date(date.getTime() + lag*24*60000);
                    }
                }

                if (districts.indexOf(district) > -1 && checktime){

                    var algorithm_call = Meteor.call('algorithm',district,date,timezoneOffset);
                    var rouletteResults = algorithm_call.rouletteResults;

                    textmessage = 'Votre tirage';
                    var stars = Meteor.call('createStars','+');
                    textmessage += ' ' + stars + '\n';

                    var p = Meteor.call('getPriceInterval',rouletteResults);  
                    if(p.minPrice !== p.maxPrice)
                        priceInterval =  p.minPrice + '€' + '-' + p.maxPrice + '€';
                    else
                        priceInterval = p.minPrice + '€ environ';
                    textmessage += priceInterval + '\n';

                    var activitiesString = '';
                    for (k=0; k < rouletteResults.length; k++)
                        activitiesString += createString(rouletteResults[k]);
                    textmessage += activitiesString;
                    
                    if(districtRequired > 0)
                        textmessage += '\n"Roulette ' + districtRequired +'" pour un autre tirage !';
                    else
                        textmessage += '\n"Roulette" pour un autre tirage !';

                    Nexmo.sendTextMessage('Roulette',recipient,textmessage);

                    draw.district = district;
                    draw.recipient = recipient;
                    draw.bookRestaurant = false;
                    draw.roulettecount = roulettecount;
                    Draws.insert(draw);
                    for (k=0; k < draw.resultsId.length;k++){
                        Activities.update({_id: draw.resultsId[k]}, {$inc: {draws: 1}});

                    }                                  
                }           
            }

            else if (pattbook.test(text)){
                
                if(doc.bookRestaurant === false){

                    var restaurant = doc.restaurant;

                    if((typeof restaurant !== 'undefined') && restaurant !== null){
                        textmessage = restaurant.name + ' - ' + restaurant.district + 'e' + '\n';
                        textmessage += 'Réservation au ' + restaurant.contact;
                        Nexmo.sendTextMessage('33644631000',recipient,textmessage);
                        Draws.update({_id: doc._id}, {$set: {bookRestaurant: true}});
                    }
                }
            }

            this.response.statusCode = 200; 
            this.response.end();     
        }
    });
});