Router.configureBodyParsers = function() {
    Router.onBeforeAction(Iron.Router.bodyParser.json({
//        extended: true,
        limit: '50mb'
    }), {where: 'server'});
};


Router.map(function() {
    this.route('cinefilmovies', {
        path: '/cinefilmovies',
        where: 'server',
        action: function() {
		    this.response.setHeader('Access-Control-Allow-Origin', '*' );
			console.log('Webhook reached');
			console.log('request.body : ', this.request.body);
			console.log('request.body STRINGIFIED : ', JSON.stringify(this.request.body));
			console.log('body : ', this.body);
			console.log('body.data : ', this.request.body.data);
			console.log('data : ', this.data);
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