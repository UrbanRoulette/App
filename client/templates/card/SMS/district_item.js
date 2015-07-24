Template.districtItem.events({
	'click .type-district': function(e){
		Session.set('district',this.valueOf());
	}
});

Template.districtItem.helpers({
	selectedDistrict: function(){
		if (Session.get('district') === this.valueOf())
			return 'type-district-selected';
	}
});