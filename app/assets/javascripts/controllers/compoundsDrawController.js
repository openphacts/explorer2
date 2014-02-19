App.CompoundsDrawController = Ember.ObjectController.extend({

  needs: ['application'],

  queryParams: ['smiles'],

  smiles: '',

  fetching: false,

  actions: {

      useMolecule: function() {
          var me = this;
          var smiles = document.getElementById('ketcher-iframe').contentWindow.ketcher.getSmiles();
          //var molfile = document.getElementById('ketcher-iframe').contentWindow.ketcher.getMolfile();
          //App.Molfile = smiles;
          var structureSearcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
          var structureCallback = function(success, status, response) {
              if (success) {
                var uri = structureSearcher.parseSmilesToURLResponse(response);
                // got the uri from the smiles so now fetch the compound
	            me.transitionToRoute('compounds.structure', {queryParams: {'uri': uri, 'type': 'exact'}});
              } else {
			    App.FlashQueue.pushFlash('error', 'No compound found with this structure');
              }
          }
          structureSearcher.smilesToURL(smiles, structureCallback);
      }

  }

});
