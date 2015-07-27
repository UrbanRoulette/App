Activities = new Mongo.Collection("activities");

Activities.attachSchema(new SimpleSchema({
  name: {
  type: String, 
  label: 'Nom du lieu de l\'activité (ex: Grand Rex, chez Gladines)',
  },

  type: {
    type: String,
    label: "Type d'activité (cinéma, restaurant, ...)",
    max: 110
  },
  
  address: {
    type: String,
    label: "Adresse",
  },

  district: {
    type: Number,
    optional: true
  },

  metrostation: {
    type: [String],
    label: 'Station(s) de métro',
    optional: true
  },

  specific: {
    type: String,
    label:'Activité spécifique ("Terminator" (cinéma), "Big Mac" (restaurant), ...)',
    optional: true
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
    label: 'Durée (format: [heure(s)]h[minute(s)])'
  },

  requiresun: {
    type: Boolean,
    optional: true,
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
    label: 'Lien vers site web si existant',
    optional: true
  },

  longUrl: {
    type: String,
    optional: true
  },

  contact: {
    type: String,
    label: 'Contact si existant (laisser vide sinon)',
    optional: true
  },

  image: {
    type: String,
    label: "URL de l'image associée",
    optional: true
  },

  source: {
    type: String,
    label: "Source de l'activité",
  },

  submitted: {
    type: Date,
    optional: true,
    autoform: {
      omit: true
    }
  },

  index: {
    type: Number,
  },

}));
