Meteor.methods({

	get_weather: function(center){
		var URLrequest =  "http://api.openweathermap.org/data/2.5/weather?lat=" + center.lat + "&lon=" + center.lng + "&APPID=c8c3d5213625cfb230413935cb2ee5e9";
		var weatherId = HTTP.call("GET", URLrequest).data.weather[0].id;
		var weather;
		if([600,801].indexOf(weatherId) > -1) weather = "sun";
		else if([802,803,804].indexOf(weatherId) > -1) weather = "clouds";
		else weather = "rain";
		return weather;
    }
});