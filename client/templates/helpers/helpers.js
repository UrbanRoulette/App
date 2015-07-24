Template.registerHelper('pluralize', function(n, thing) {
  // pluraliser assez simpliste
  if (n < 2) 
    return thing;
  else if (n >= 2)
  	return thing + 's';
});