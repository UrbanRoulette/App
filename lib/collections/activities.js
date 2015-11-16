Activities = new Mongo.Collection("activities");

/*
Activities.attachSchema(new SimpleSchema({

  specific: {
    type: String,
    label:'Activité spécifique ("Terminator" (cinéma), "Big Mac" (restaurant), ...)',
    optional: true
  },

  name: {
  type: String, 
  label: 'Nom du lieu de l\'activité (ex: Grand Rex, chez Gladines)',
  optional: true
  },

  type: {
    type: String,
    label: "Type d'activité (cinéma, restaurant, ...)",
    optional: true
  },

  subtype: {
    type: String,
    label: "Sous-type d'activité",
    optional: true,
  },
  
  address: {
    type: String, //Should be object
    label: "Adresse",
    optional: true
  },

  placeId: {
    type: String,
    optional: true
  },

  metrostation: {
    type: [String],
    label: 'Station(s) de métro',
    optional: true
  },

  specifictoTime: {
    type: Object,
    optional: true,
  },

  description: {
    type: String,
    label:'Description',
    optional: true
  },

  price: {
    type: String,
    label: 'Prix (exact ou estimation)',
    optional: true
  },

  last: {
    type: Number,
    optional: true
  },

  requiresun: {
    type: Boolean,
    optional: true
  },

  requirebooking: {
    type: Boolean,
    optional: true
  },

  openinghours: {
    type:[String],
    optional: true
  },
  monday: {
    type:[String],
    optional: true
  },
  tuesday: {
    type:[String],
    optional: true
  },
  wednesday: {
    type:[String],
    optional: true
  },
  thursday: {
    type:[String],
    optional: true
  },
  friday: {
    type:[String],
    optional: true
  },
  saturday: {
    type:[String],
    optional: true
  },
  sunday: {
    type:[String],
    optional: true
  },
  temporary: {
    type: Boolean,
    optional: true
  },

  startdate: {
    type: Date,
    optional: true
  },

  enddate: {
    type: Date,
    optional: true
  },

  yearperiodic: {
    type: Boolean,
    optional: true
  },

  mark: {
    type: String,
    label:"Note sur 5 (virgule à 1 décimale autorisée)",
    optional: true
  },

  link: {
    type: String,
    optional: true,
  },

  longUrl: {
    type: String,
    label: 'Lien vers site web',
    optional: true
  },

  contact: {
    type: String,
    label: 'Contact si existant (laisser vide sinon)',
    optional: true
  },

  image: {
    type: String,
    autoform: {
      afFieldInput: {
        type: "fileUpload",
        collection: "Images",
        label: "Choose file" 
      }
    },
    label: "URL de l'image associée",
      optional: true
  },
  
  profile: {
    type: [String],
    optional: true
  },

  source: {
    type: String,
    label: "Source de l'activité",
    optional: true
  },

  draws: {
    type: Number,
    optional: true
  },
  index: {
    type: Object,
    optional: true
  },
  rand:{
    type: Number,
    optional:true,
  },
  latlng:{
    type: Object,
    optional: true
  }
}));
*/