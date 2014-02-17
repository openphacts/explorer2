/****************************************************************************
 * Copyright (C) 2009-2010 GGA Software Services LLC
 * 
 * This file may be distributed and/or modified under the terms of the
 * GNU Affero General Public License version 3 as published by the Free
 * Software Foundation and appearing in the file LICENSE.GPL included in
 * the packaging of this file.
 * 
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 ***************************************************************************/

ketcher = function () {
    this.render = null;
};

ketcher.init = function ()
{
    console.log('Ketcher Init');
    ui.init();
    encoded_molfile = window.location.search.substring(window.location.search.indexOf('molfile') + 8);
    if (encoded_molfile != '') {
        unencoded_molfile = unescape(encoded_molfile);
        this.setMolecule(unencoded_molfile);
    }
};

ketcher.getSmiles = function ()
{
    var saver = new chem.SmilesSaver();
    return saver.saveMolecule(ui.ctab, true);
}

ketcher.getMolfile = function ()
{
    var saver = new chem.MolfileSaver();
    return saver.saveMolecule(ui.ctab);
}

ketcher.setMolecule = function (mol_string)
{
    if (!Object.isString(mol_string))
        return;

    ui.loadMolecule(mol_string);
}

ketcher.showMolfile = function (clientArea, molfileText, isRxn, autoScale)
{
    this.render = new rnd.Render(clientArea, 75, {
        'showSelectionRegions':false,
        'showBondIds':false,
        'showHalfBondIds':false,
        'showLoopIds':false,
        'showAtomIds':false,
		'autoScale':autoScale||false,
		'autoScaleMargin':20
    });
    if (molfileText)
        this.render.setMolecule(chem.Molfile.parseMolfile(molfileText.split('\n'), isRxn));
    this.render.update();
    return this.render;
}
