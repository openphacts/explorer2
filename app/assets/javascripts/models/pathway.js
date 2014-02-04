App.Pathway = DS.Model.extend({
  compound: DS.belongsTo('searchResult'),
  title: DS.attr('string'),
  identifier: DS.attr('string'),
  description: DS.attr('string'),
  pathwayOntologies: DS.attr(),
  organism: DS.attr('string'),
  organismLabel: DS.attr('string'),
  geneProductLabel: DS.attr('string'),
  geneProductURI: DS.attr('string'),
  geneProductCWURI: DS.attr('string'),
  about: DS.attr('string'),
  parts: DS.attr(),
  compounds: DS.hasMany('compound', { async: true }),
  targets: DS.hasMany('target', { async: true }),
  revision: DS.attr('string'),
  URI: DS.attr('string'),
  wikipathwaysProvenance: DS.attr()
});
