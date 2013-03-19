App.Compound = DS.Model.extend({
    id: null,
    exactMatch: false,
alogp: DS.attr('string'),
alogpItem: DS.attr('string'),
alogpSrc: DS.attr('string'),
biotransformationItem: DS.attr('string'),
biotransformationSrc: DS.attr('string'),
chemblUri: DS.attr('string'),
compoundPrefLabel: DS.attr('string'),
compoundPrefLabelIitem: DS.attr('string'),
compoundPrefLabelSrc: DS.attr('string'),
compoundSmiles: DS.attr('string'),
compoundSmilesItem: DS.attr('string'), 
compoundSmilesSrc: DS.attr('string'),
csUri: DS.attr('string'),
cwUri: DS.attr('string'),
description: DS.attr('string'), 
descriptionItem: DS.attr('string'), 
descriptionSrc: DS.attr('string'),
drugbankUri: DS.attr('string'),
fullMwt: DS.attr('string'),
fullMwtItem: DS.attr('string'), 
fullMwtSrc: DS.attr('string'),
hba: DS.attr('string'),
hbaItem: DS.attr('string'), 
hbaSrc: DS.attr('string'),
hbd: DS.attr('string'),
hbdItem: DS.attr('string'),
hbdSrc: DS.attr('string'),
inchi: DS.attr('string'),
inchiItem: DS.attr('string'), 
inchiKey: DS.attr('string'),
inchiKeyItem: DS.attr('string'),
inchiKeySrc: DS.attr('string'),
inchiSrc: DS.attr('string'),
meltingPoint: DS.attr('string'),
meltingPointItem: DS.attr('string'),
meltingPointSrc: DS.attr('string'),
molform: DS.attr('string'),
molformItem: DS.attr('string'),
molformSrc: DS.attr('string'),
mwFreebase: DS.attr('string'),
mwFreebaseItem: DS.attr('string'), 
mwFreebaseSrc: DS.attr('string'),
proteinBinding: DS.attr('string'),
proteinBindingItem: DS.attr('string'), 
proteinBindingSrc: DS.attr('string'),
psa: DS.attr('string'),
psaItem: DS.attr('string'), 
psaSrc: DS.attr('string'),
rtb: DS.attr('string'),
rtbItem: DS.attr('string'),
rtbSrc: DS.attr('string'),
toxicity: DS.attr('string'),
toxicityItem: DS.attr('string'), 
toxicitySrc: DS.attr('string')
});
