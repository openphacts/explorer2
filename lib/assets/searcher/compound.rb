module Searcher

  class Compound

    include GeneralInit
    attr_accessor :cw_uri, :cs_uri, :chembl_uri, :drugbank_uri, :inchi, :inchi_src, :inchi_item, :inchi_key, :inchi_key_item, :inchi_key_src,
                  :compound_smiles, :compound_smiles_src, :compound_smiles_item, :logp, :alogp_src, :alogp_item, :full_mwt, :full_mwt_src,
                  :full_mwt_item, :hba, :hba_src, :hba_item, :hbd, :hbd_src, :hbd_item, :molform, :molform_src, :molform_item, :mw_freebase,
                  :mw_freebase_src, :mw_freebase_item, :psa, :psa_src, :psa_item, :rtb, :rtb_src, :rtb_item, :biotransformation,
                  :biotransformation_src, :biotransformation_item, :description, :description_src, :description_item, :protein_binding,
                  :proteinBinding_src, :proteinBinding_item, :toxicity, :toxicity_src, :toxicity_item, :pref_label,
                  :compound_pref_label_src, :compound_pref_label_item, :meltingPoint, :meltingPoint_src, :meltingPoint_item
    attr_writer :cw_uri, :cs_uri, :chembl_uri, :drugbank_uri, :inchi, :inchi_src, :inchi_item, :inchi_key, :inchi_key_item, :inchi_key_src,
                :compound_smiles, :compound_smiles_src, :compound_smiles_item, :logp, :alogp_src, :alogp_item, :full_mwt, :full_mwt_src,
                :full_mwt_item, :hba, :hba_src, :hba_item, :hbd, :hbd_src, :hbd_item, :molform, :molform_src, :molform_item, :mw_freebase,
                :mw_freebase_src, :mw_freebase_item, :psa, :psa_src, :psa_item, :rtb, :rtb_src, :rtb_item, :biotransformation,
                :biotransformation_src, :biotransformation_item, :description, :description_src, :description_item, :protein_binding,
                :proteinBinding_src, :proteinBinding_item, :toxicity, :toxicity_src, :toxicity_item, :pref_label,
                :compound_pref_label_src, :compound_pref_label_item, :meltingPoint, :meltingPoint_src, :meltingPoint_item

  end

end
