// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require ConsoleDummy.min
//= require modernizr
//= require jquery
//= require jqXDomain
//= require handlebars-v1.3.0
//= require ember-1.7.0
//= require ember-data-1.0.0-beta5
//= require bootstrap
//= require combined
//= require_self
//= require store
//= require routes
//= require routeSetup
//= require helpers
//= require_tree ./controllers
//= require models
//= require URI
//= require purl
//= require_tree ./templates
//= require_tree ./views

window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
})
App.Molfile = null;
