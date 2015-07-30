App.TargetsIndexController = Ember.Controller.extend({

    needs: ['application', 'flash'],

    queryParams: ['uri'],

    uri: '',

    molViewer: null,

    threeDeeTarget: null,

    showMolecule: false,

    pdbStructure: null,

    webGLEnabled: Modernizr.webgl,

    hasPDB: function() {
	    if (this.get('model').get('seeAlso') != null) {
        if (this.get('model').get('seeAlso').length > 0) {
            return true;
        } else {
            return false;
        }
	    }
    }.property('model.seeAlso'),

    threeDeeEnabled: function() {
        return Modernizr.webgl == true && Modernizr.canvas == true;
    }.property('webGLEnabled'),

    favourite: function() {
        return this.get('model').get('favourite');
    }.property('model.favourite'),


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

        changeFavouriteStatus: function() {
            console.log('changing favourite status');
            this.get('controllers.application').addFavourite('targets', this.get('model').get('URI'), this.get('model').get('prefLabel'), this.get('model'));
        },

        drawProtein: function() {
            var me = this;
            if (me.get('content').get('seeAlso').length > 0) {
                if (me.get('pdbStructure') == null) {
                    var uri = "http://www.pdb.org/pdb/files/" + me.get('content').get('seeAlso')[0].split('/').pop() + ".pdb"
                    $.get(uri, function(ret) {
                        me.set('pdbStructure', ret);
                        $("#glmol01_src").val(ret);
                        // Draw the protein using the following params. Lots commented out but in the original
                        // glmol examples. Maybe these can be user configured.
                        me.get('molViewer').defineRepresentation = function() {
                            //var idHeader = "#" + this.id + '_';

                            var time = new Date();
                            var all = this.getAllAtoms();
                            //if ($(idHeader + 'biomt').attr('checked') && this.protein.biomtChains != "") all = this.getChain(all, this.protein.biomtChains);
                            var allHet = this.getHetatms(all);
                            var hetatm = this.removeSolvents(allHet);

                            console.log("selection " + (+new Date() - time));
                            time = new Date();

                            this.colorByAtom(all, {});
                            var colorMode = "chainbow"; //$(idHeader + 'color').val();
                            if (colorMode == 'ss') {
                                this.colorByStructure(all, 0xcc00cc, 0x00cccc);
                            } else if (colorMode == 'chain') {
                                this.colorByChain(all);
                            } else if (colorMode == 'chainbow') {
                                this.colorChainbow(all);
                            } else if (colorMode == 'b') {
                                this.colorByBFactor(all);
                            } else if (colorMode == 'polarity') {
                                this.colorByPolarity(all, 0xcc0000, 0xcccccc);
                            }
                            console.log("color " + (+new Date() - time));
                            time = new Date();

                            var asu = new THREE.Object3D();
                            var mainchainMode = "ribbon"; //$(idHeader + 'mainchain').val();
                            var doNotSmoothen = false; //($(idHeader + 'doNotSmoothen').attr('checked') == 'checked');
                            //if ($(idHeader + 'showMainchain').attr('checked')) {
                            if (mainchainMode == 'ribbon') {
                                this.drawCartoon(asu, all, doNotSmoothen);
                                this.drawCartoonNucleicAcid(asu, all);
                            } else if (mainchainMode == 'thickRibbon') {
                                this.drawCartoon(asu, all, doNotSmoothen, this.thickness);
                                this.drawCartoonNucleicAcid(asu, all, null, this.thickness);
                            } else if (mainchainMode == 'strand') {
                                this.drawStrand(asu, all, null, null, null, null, null, doNotSmoothen);
                                this.drawStrandNucleicAcid(asu, all);
                            } else if (mainchainMode == 'chain') {
                                this.drawMainchainCurve(asu, all, this.curveWidth, 'CA', 1);
                                this.drawMainchainCurve(asu, all, this.curveWidth, 'O3\'', 1);
                            } else if (mainchainMode == 'cylinderHelix') {
                                this.drawHelixAsCylinder(asu, all, 1.6);
                                this.drawCartoonNucleicAcid(asu, all);
                            } else if (mainchainMode == 'tube') {
                                this.drawMainchainTube(asu, all, 'CA');
                                this.drawMainchainTube(asu, all, 'O3\''); // FIXME: 5' end problem!
                            } else if (mainchainMode == 'bonds') {
                                this.drawBondsAsLine(asu, all, this.lineWidth);
                            }
                            //}

                            //if ($(idHeader + 'line').attr('checked')) {
                            //    this.drawBondsAsLine(this.modelGroup, this.getSidechains(all), this.lineWidth);
                            //}
                            //console.log("mainchain " + (+new Date() - time));
                            time = new Date();

                            //if ($(idHeader + 'showBases').attr('checked')) {
                            var hetatmMode = "nuclLine"; //$(idHeader + 'base').val();
                            if (hetatmMode == 'nuclStick') {
                                this.drawNucleicAcidStick(this.modelGroup, all);
                            } else if (hetatmMode == 'nuclLine') {
                                this.drawNucleicAcidLine(this.modelGroup, all);
                            } else if (hetatmMode == 'nuclPolygon') {
                                this.drawNucleicAcidLadder(this.modelGroup, all);
                            }
                            //}

                            var target = this.modelGroup;
                            //if ($(idHeader + 'showNonBonded').attr('checked')) {
                            //    var nonBonded = this.getNonbonded(allHet);
                            //    var nbMode = $(idHeader + 'nb').val();
                            //    if (nbMode == 'nb_sphere') {
                            //        this.drawAtomsAsIcosahedron(target, nonBonded, 0.3, true);
                            //    } else if (nbMode == 'nb_cross') {
                            //        this.drawAsCross(target, nonBonded, 0.3, true);

                            //    }
                            //}

                            //if ($(idHeader + 'showHetatms').attr('checked')) {
                            var hetatmMode = "sphere"; //$(idHeader + 'hetatm').val();
                            if (hetatmMode == 'stick') {
                                this.drawBondsAsStick(target, hetatm, this.cylinderRadius, this.cylinderRadius, true);
                            } else if (hetatmMode == 'sphere') {
                                this.drawAtomsAsSphere(target, hetatm, this.sphereRadius);
                            } else if (hetatmMode == 'line') {
                                this.drawBondsAsLine(target, hetatm, this.curveWidth);
                            } else if (hetatmMode == 'icosahedron') {
                                this.drawAtomsAsIcosahedron(target, hetatm, this.sphereRadius);
                            } else if (hetatmMode == 'ballAndStick') {
                                this.drawBondsAsStick(target, hetatm, this.cylinderRadius / 2.0, this.cylinderRadius, true, false, 0.3);
                            } else if (hetatmMode == 'ballAndStick2') {
                                this.drawBondsAsStick(target, hetatm, this.cylinderRadius / 2.0, this.cylinderRadius, true, true, 0.3);
                            }

                            //}
                            console.log("hetatms " + (+new Date() - time));
                            time = new Date();

                            var projectionMode = "perspective"; //$(idHeader + 'projection').val();
                            if (projectionMode == 'perspective') this.camera = this.perspectiveCamera;
                            else if (projectionMode == 'orthoscopic') this.camera = this.orthoscopicCamera;

                            //this.setBackground(parseInt($(idHeader + 'bgcolor').val()));

                            //if ($(idHeader + 'cell').attr('checked')) {
                            //    this.drawUnitcell(this.modelGroup);
                            //}

                            //if ($(idHeader + 'biomt').attr('checked')) {
                            //    this.drawSymmetryMates2(this.modelGroup, asu, this.protein.biomtMatrices);
                            //}
                            //if ($(idHeader + 'packing').attr('checked')) {
                            //    this.drawSymmetryMatesWithTranslation2(this.modelGroup, asu, this.protein.symMat);
                            //}
                            this.modelGroup.add(asu);
                        };
                        me.get('molViewer').loadMolecule();
                        me.set('showMolecule', true);
                        me.get('threeDeeTarget').modal('show');
                    }).fail(function(){
			    me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
				    type: 'error',
			            message: 'Could not retrieve the PDB file for 3D display. It is probably not available for this target.'
			    }));
		    });
                } else {
                    //already loaded, just show it
                    me.get('threeDeeTarget').modal('show');
                }
            }
        }
    }

});
