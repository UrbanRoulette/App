Template.SMSdistrictItem.events({
	'click .type-district': function(e){
		Session.set('district',this.valueOf());
	}
});

Template.SMSdistrictItem.helpers({
	selectedDistrict: function(){
		if (Session.get('district') === this.valueOf())
			return 'sms-type-district-selected';
	}
});