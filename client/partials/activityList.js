var fakeActivies = function() {
  var activityFixtures = [{
    specific: "Goûter au bon plat du jour",
    name: "Le Petit Olivier",
    address: "82 rue du Cherche Midi 75006 Paris",
    image: "https://www.lespetitestables.com/wp-content/uploads/le-petit-olivier-salle.jpg",
    description: "En arrivant dans la rue, nous avons croisé Frédéric Beigbeder. Au moment du dessert, coup d’œil par la vitrine : Edouard Baer hâtait le pas en rajustant sa mèche. Il faut dire que Le Petit Olivier campe dans un coin très chic du 6e arrondissement, entre éditeurs, architectes et antiquaires, d’ailleurs habitués des lieux. Pas de quoi en faire un flan pour Laurent, le patron, qui envoie midi et soir une petite formule à 10 euros détonnant dans les parages. A savoir, un petit plat du jour bien fagoté, comme ce merlu servi avec du riz sur fond de rouille et sauce bouillabaisse ou ce civet de sanglier mijoté quatre heures, flanqué de pommes de terre et petits légumes. Suit le dessert, du type crumble aux pommes, île flottante aux fruits rouges ou mousse au chocolat, à piocher dans la vitrine à gourmandises. Le tout s’avale sur fond de musique classique, entre une antique banquette échappée du Fouquet’s et, au fond, un piano sur lequel s’activent parfois les étudiants de Sciences Po. So smart. Formule plat du jour ou burger ou salade ou soupe + dessert : 10 € Entrée + plat + dessert : 15 €",
    price: "15€",
    time_start: "12:45",
    time_end: "13:45"
  }, {
    specific: "Prendre une crème glacée goûteuse",
    name: "Grom",
    address: "81, rue de Seine, 75006",
    image: "https://www.lebonbon.fr/wp-content/uploads/2014/07/grom3-620x400-e1435848236762.jpg",
    description: "En te baladant à Saint-Germain-des-Prés, rien de tel qu’une petite pause gourmande chez Grom, qui sert de vraies crèmes glacées goûteuses à la texture aérienne ! En cas de petite faim, tu peux toujours opter pour les granités. Le pâtissier italien ne choisit que des produits méga quali comme les crèmes fabriquées à partir de lait de haute qualité et les œufs de poules élevées en extérieur. Rien que ça !",
    price: "10€",
    time_start: "12:45",
    time_end: "13:45"
  }, {
    specific: "Bronzer sur une chaise en fer",
    name: "Jardin du Luxembourg",
    address: "2 rue Auguste Compte, 75006 Paris",
    image: "http://media.timeout.com/images/100013519/750/422/image.jpg",
    description: "Prenez le temps de vous asseoir sur une des lourdes chaises en fer qui trainent dans les allées du parc pour regarder les promeneurs, entre dragueurs et flâneurs, joueurs d’échecs et séance de taï-chi, le spectacle est intéressant.Il y a aussi les familles parisiennes qui peuvent traverser toute la ville pour venir au « Luco ». Les activités pour enfant y sont pléthore, un terrain de jeu payant propose tours de poney, glaces, spectacles de marionnettes, bac à sable, ou encore des balançoires-nacelles.",
    price: "20€",
    time_start: "12:45",
    time_end: "13:45"
  }, {
    specific: "Prendre un kilo de frites chez les Rois de la Frite",
    name: "De Clercq",
    address: "184 Rue Saint-Jacques, 75005",
    image: "http://ugc.1001menus.com/3/1/5/5/9/2/9/4/9/2/1430135861_149/6cd5828264af5c76de68fbb43afd9a44.full.jpg",
    description: "Prenez le temps de vous asseoir sur une des lourdes chaises en fer qui trainent dans les allées du parc pour regarder les promeneurs, entre dragueurs et flâneurs, joueurs d’échecs et séance de taï-chi, le spectacle est intéressant.Il y a aussi les familles parisiennes qui peuvent traverser toute la ville pour venir au « Luco ». Les activités pour enfant y sont pléthore, un terrain de jeu payant propose tours de poney, glaces, spectacles de marionnettes, bac à sable, ou encore des balançoires-nacelles.",
    price: "40€",
    time_start: "12:45",
    time_end: "13:45"
  }, {
    specific: "Voir la plus vieille maison de Paris",
    name: "Maison du Grand-Pignon",
    address: "51 rue de Montmorency, 75003 Paris",
    image: "http://2.bp.blogspot.com/-MRNJ_yY0Fko/U61-DvHtAgI/AAAAAAAASrw/N0VGfqJg7s0/s1600/51+rue+de+montmorency+maison+au+grand+pignon+dite+maison+de+nicolas+flamel+9.JPG",
    description: "DConstruite en 1407 pour Nicolas Flamel, la maison du Grand-Pignon, rue de Montmorency, passe pour être la plus ancienne de Paris. Nicolas Flamel, personnage controversé (on l’accusa d’être un alchimiste), était un riche écrivain-juré de l’université de Paris. Epris de charité, il fit construire cette maison pour y loger les pauvres à condition que ceux-ci récitent chaque jour un Notre Père et un Je vous salue Marie pour les morts. Cette requête figure en vieux français sur la façade de l’immeuble",
    price: "45€",
    time_start: "12:45",
    time_end: "13:45"
  }];

  return _.shuffle(activityFixtures);
};

Template.activityList.events({
  'click .activity-list__retry': function() {
    var center = {lat:48.8581638,lng:2.362247000000025};
    var radius = 3 / 3963.2; //Converts miles into radians
    Session.set('fakeActivity', Meteor.call('get_activities_results',center,radius));
  },

});

Template.activityList.helpers({
  activities: function() {
    Session.set('fakeActivity', fakeActivies());
    return Session.get('fakeActivity');
  }
});