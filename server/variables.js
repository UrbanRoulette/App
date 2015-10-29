Meteor.startup(function(){

	//Variables
	weekday = new Array(7);
	weekday[0]=  "sunday";
	weekday[1] = "monday";
	weekday[2] = "tuesday";
	weekday[3] = "wednesday";
	weekday[4] = "thursday";
	weekday[5] = "friday";
	weekday[6] = "saturday";

	lunchHours = [12,13];
	dinnerHours = [19,20];
	eatingHours = lunchHours.concat(dinnerHours);	

});

