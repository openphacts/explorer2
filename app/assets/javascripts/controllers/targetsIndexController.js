App.TargetsIndexController = Ember.ObjectController.extend({

    needs: ['application'],

    queryParams: ['uri'],

    uri: '',

    molViewer: null,

    pdbStructure: null,

    showProvenance: false,

    actions: {
        enableProvenance: function() {
            this.set('showProvenance', true);
            console.log("Target provenance enabled");
        },

        disableProvenance: function() {
            this.set('showProvenance', false);
            console.log("Target provenance disabled");
        },
        drawProtein: function() {
            var me = this;
            if (me.get('pdbStructure') == null) {
                var uri = "http://www.pdb.org/pdb/files/" + me.get('content').get('seeAlso')[0].split('/').pop() + ".pdb"
                $.get(uri, function(ret) {
                    me.set('pdbStructure', ret);
                    $("#glmol01_src").val(ret);
                    me.get('molViewer').loadMolecule();
                    me.get('molViewer').defineRepresentation = function() {
                        var all = this.getAllAtoms();
                        var hetatm = this.removeSolvents(this.getHetatms(all));
                        this.colorByAtom(all, {});
                        this.colorByChain(all);
                        var asu = new THREE.Object3D();

                        this.drawBondsAsStick(asu, hetatm, this.cylinderRadius, this.cylinderRadius);
                        this.drawBondsAsStick(asu, this.getResiduesById(this.getSidechains(this.getChain(all, ['A'])), [58, 87]), this.cylinderRadius, this.cylinderRadius);
                        this.drawBondsAsStick(asu, this.getResiduesById(this.getSidechains(this.getChain(all, ['B'])), [63, 92]), this.cylinderRadius, this.cylinderRadius);
                        this.drawCartoon(asu, all, this.curveWidth, this.thickness);

                        this.drawSymmetryMates2(this.modelGroup, asu, this.protein.biomtMatrices);
                        this.modelGroup.add(asu);
                    };;
                    me.get('molViewer').show();
                });
            } else {
                $("#glmol01_src").val(me.get('pdbStructure'));
                me.get('molViewer').loadMolecule();

            }
        }
    }

});
