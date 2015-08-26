Activities = new Mongo.Collection("activities");

Activities.attachSchema(new SimpleSchema({

  copies: {
  type: Number, 
  label: 'Nombre de copies théoriques',
  },

  name: {
  type: String, 
  label: 'Nom du lieu de l\'activité (ex: Grand Rex, chez Gladines)',
  },

  type: {
    type: String,
    label: "Type d'activité (cinéma, restaurant, ...)",
  },

  subtype: {
    type: String,
    label: "Sous-type d'activité",
    optional: true,
  },
  
  address: {
    type: String,
    label: "Adresse",
  },

  district: {
    type: Number,
    label: "Arrondissement (si existant)",
  },

  metrostation: {
    type: [String],
    label: 'Station(s) de métro',
    optional: true
  },

  specific: {
    type: String,
    label:'Activité spécifique ("Terminator" (cinéma), "Big Mac" (restaurant), ...)',
  },

  specifictoTime: {
    type: Object,
    optional: true,
  },

  description: {
    type: String,
    label:'Description',
    autoform: {
    afFieldInput: {
    type: 'summernote',
//        class: 'editor', // optional
//        settings: // summernote options goes here
      }
    }
  },

  price: {
    type: String,
    label: 'Prix (exact ou estimation)'
  },

  last: {
    type: Number,
  },

  requiresun: {
    type: Boolean,
  },

  requirebooking: {
    type: Boolean,
  },

  monday: {
    type:[String],
    label: 'Lundi',
    optional: true
  },

  tuesday: {
    type:[String],
    label: 'Mardi',
    optional: true
  },

  wednesday: {
    type:[String],
    label: 'Mercredi',
    optional: true
  },

  thursday: {
    type:[String],
    label: 'Jeudi',
    optional: true
  },

  friday: {
    type:[String],
    label: 'Vendredi',
    optional: true
  },

  saturday: {
    type:[String],
    label: 'Samedi',
    optional: true
  },

  sunday: {
    type:[String],
    label: 'Dimanche',
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
  },

  contact: {
    type: String,
    label: 'Contact si existant (laisser vide sinon)',
    optional: true
  },

  image: {
    type: String,
    label: "URL de l'image associée",
  },

  source: {
    type: String,
    label: "Source de l'activité",
  },

  submitted: {
    type: Date,
    autoform: {
      omit: true
    }
  },

  draws: {
    type: Number
  },

  index: {
    type: Number,
    optional: true
  },

}));
