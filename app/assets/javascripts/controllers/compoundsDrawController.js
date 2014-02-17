App.CompoundsDrawController = Ember.ObjectController.extend({

  needs: ['application'],

  queryParams: ['smiles'],

  smiles: '',

  fetching: false,

  radioOpenFromInput: false,

  onSelectOpenFromInput: function() {
      $('open_from_input').show();
      $('open_from_file').hide();
      ui.onChange_Input.call($('input_mol'));
      $('input_mol').activate();
  },

  initKetcher: function() {
    ketcher.init();
  },

  actions: {

    newFile: function() {
        ui.modeType() === ui.MODE.PASTE ? ui.cancelPaste() : '';
        ui.selectMode('select_simple');
    
        if (ui.ctab.atoms.count() !== 0) {
          ui.addUndoAction(ui.Action.fromNewCanvas(new chem.Molecule()));
          ui.render.update();
        }
    },

    openFile: function() {
        if (ui.modeType() == ui.MODE.PASTE)
        {
          ui.cancelPaste();
          ui.selectMode('select_simple');
        }
        ui.showDialog('open_file');
        this.radioOpenFromInput = true;
        this.onSelectOpenFromInput();
    }
  }

});
