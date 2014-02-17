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
//= require ember-latest
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
//=require ketcher/raphael-min
//=require ketcher/chem/common
//=require ketcher/chem/vec2
//=require ketcher/chem/map
//=require ketcher/chem/pool
//=require ketcher/chem/element
//=require ketcher/chem/molecule
//=require ketcher/chem/molfile
//=require ketcher/chem/sgroup
//=require ketcher/chem/dfs
//=require ketcher/chem/cis_trans
//=require ketcher/chem/stereocenters
//=require ketcher/chem/smiles
//=require ketcher/rnd/events
//=require ketcher/rnd/visel
//=require ketcher/rnd/moldata
//=require ketcher/rnd/moldata_valence
//=require ketcher/rnd/drawing
//=require ketcher/rnd/render
//=require ketcher/ui/log
//=require ketcher/ui/ui
//=require ketcher/ketcher

window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
})
