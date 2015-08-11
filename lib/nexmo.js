Router.configureBodyParsers = function() {
    Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
        extended: true,
        limit: '20mb'
    }), {where: 'server'});
};  

Router.map(function() {
    this.route('sendSMS', {
        path: '/send_roulette',
        where: 'server',
        action: function() {

            Nexmo.initialize('3c380619', '390ebd8a', 'http OR https', 'DEBUG (true)');

            this.response.setHeader('Access-Control-Allow-Origin', '*' );

            var query = this.request.query;
            var recipient = query.msisdn;
            console.log('Recipient: ' + recipient);
            var doc = Draws.findOne({recipient: recipient}, {sort: {start: -1, _id: -1}}); 
            console.log(doc); 
            var text = query.text;
            console.log('Text: ' + text);
            text = text.replace(/ /,'');
            console.log('Text SANS ESPACE: ' + text);
            pattroulette = /^Roulette([0-9]{0,2})$/i;
            pattbook = /^Réserverrestaurant$/i;

            
            if(pattroulette.test(text)){

                var checkcount = false;
                console.log('Test passed');
                pattroulette.exec(text);

                district = RegExp.$1;
                district = (district === '') ? 0 : parseInt(district);
                console.log('District : ' + district);
                var districts = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
                var maxRoulette = 3;

                if (districts.indexOf(district) > -1){

                    var roulettecount = 1;

                    if(typeof doc !== 'undefined'){

                        previous = new Date(doc.startDate).setHours(0,0,0,0);
                        current = new Date().setHours(0,0,0,0);
                        console.log('Current date : ' + current);

                        if (previous === current && doc.roulettecount < maxRoulette) {
                            checkcount = true;
                            roulettecount = doc.roulettecount + 1;
                        }
                        else if (previous === current && doc.roulettecount === maxRoulette){

                                Nexmo.sendTextMessage('33644631000',recipient,'Le nombre de roulettes est limité à 3 par jour!\nEmprunte le portable d\'un ami pour continuer de la faire tourner !');
                                Draws.update({_id: doc._id}, {$set: {roulettecount: maxRoulette + 1}});

                        }
                        else if (previous !== current)
                            checkcount = true;
                    }
                    else
                        checkcount = true;

                    if (checkcount){
                        textmessage = algorithm_SMS(district); 
                        console.log('Text message: ' + textmessage);

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
            }

            else if (pattbook.test(text)){
                
                if(doc.bookRestaurant === false){
                    var restaurant = doc.restaurant;
                    textmessage = restaurant.name + ' - ' + restaurant.district + 'e' + '\n';
                    textmessage += 'Réservation au ' + restaurant.contact;
                    Nexmo.sendTextMessage('33644631000',recipient,textmessage);
                    Draws.update({_id: doc._id}, {$set: {bookRestaurant: true}});
                }
            }

            this.response.statusCode = 200; 
            this.response.end();     
        }
    });
});