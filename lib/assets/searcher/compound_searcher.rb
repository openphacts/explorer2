require 'compound'

module Searcher
  class CompoundSearcher

    LDA_SRC_CLS_MAPPINGS = {
        'http://www.conceptwiki.org' => 'conceptWikiValue',
        'http://www.conceptwiki.org/' => 'conceptWikiValue',
        'http://data.kasabi.com/dataset/chembl-rdf' => 'chemblValue',
        'http://www4.wiwiss.fu-berlin.de/drugbank' => 'drugbankValue',
        'http://linkedlifedata.com/resource/drugbank' => 'drugbankValue',
        'http://www.chemspider.com'=> 'chemspiderValue',
        'http://www.chemspider.com/' => 'chemspiderValue',
        'http://rdf.chemspider.com' => 'chemspiderValue',
        'http://rdf.chemspider.com/' => 'chemspiderValue',
        'http://purl.uniprot.org' => 'uniprotValue',
        'http://purl.uniprot.org/' => 'uniprotValue'
    }

    LDA_ABOUT = "_about"
    LDA_IN_DATASET = "inDataset"

    def search uri
      domain = "api.openphacts.org"
      path = "/compound"
      params = "uri=" + CGI::escape(uri) + "&_format=json"
      url_path = "#{path}?".concat(params)
      puts url_path
      response = Net::HTTP.get(domain, url_path)
      json = JSON.parse(response)
    end

    def pharmacology

    end

    def parse_compound json
      pt = json['result']['primaryTopic']
      em = pt['exactMatch']
      chemspiderValue, drugBankData, chemblValue = nil
      em.each do |match|
        src = match[Searcher::CompoundSearcher::LDA_IN_DATASET]
        if (Searcher::CompoundSearcher::LDA_SRC_CLS_MAPPINGS[src] == 'chemspiderValue')
          chemspiderValue = match
        elsif (Searcher::CompoundSearcher::LDA_SRC_CLS_MAPPINGS[src] == 'drugbankValue')
          drugBankData = match
        elsif (Searcher::CompoundSearcher::LDA_SRC_CLS_MAPPINGS[src] == 'chemblValue')
          chemblValue = match
        end
      end
      conceptWikiUri = pt["_about"]
      chemspiderValue != nil ? chemSpiderUri = chemspiderValue[Searcher::CompoundSearcher::LDA_ABOUT] : chemSpiderUri = nil
      chemblValue != nil ? chemblUri = chemblValue[Searcher::CompoundSearcher::LDA_ABOUT] : chemblUri = nil
      drugBankData != nil ? drugbankUrl = drugBankData[Searcher::CompoundSearcher::LDA_ABOUT] : drugbankUrl = nil

      chemspiderValue != nil ? chemspiderLinkOut = 'http://www.chemspider.com/' + chemSpiderUri.split('/').pop() : chemspiderLinkOut = nil
      chemblValue != nil ? chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/compound/inspect/' + chemblUri.split('/').pop() : chemblLinkOut = nil
      drugBankData != nil ? drugbankLinkOut = 'http://www.drugbank.ca/drugs/' + drugbankUrl.split('/').pop() : drugbankLinkOut = nil

      compound = Searcher::Compound.new(:cw_uri =>pt[Searcher::CompoundSearcher::LDA_ABOUT],
            :cs_uri => chemspiderValue != nil ? chemspiderValue[Searcher::CompoundSearcher::LDA_ABOUT] : nil,
            :chembl_uri => chemblValue != nil ? chemblValue[Searcher::CompoundSearcher::LDA_ABOUT] : nil,
            :drugbank_uri => drugBankData != nil ? drugBankData[Searcher::CompoundSearcher::LDA_ABOUT] : nil,
            :inchi => chemspiderValue != nil ? chemspiderValue['inchi'] : nil,
            :inchi_src => chemspiderValue != nil ? chemspiderValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :inchi_item => chemspiderLinkOut,
            :inchi_key => chemspiderValue != nil ? chemspiderValue['inchikey'] : nil,
            :inchi_key_item => chemspiderLinkOut,
            :inchi_key_src => chemspiderValue != nil ? chemspiderValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :compound_smiles => chemspiderValue != nil ? chemspiderValue['smiles'] : nil,
            :compound_smiles_src => chemspiderValue != nil ? chemspiderValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :compound_smiles_item => chemspiderLinkOut,
            :alogp => chemspiderValue != nil ? chemspiderValue['logp'] : nil,
            :alogp_src => chemspiderValue != nil ? chemspiderValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :alogp_item => chemspiderLinkOut,
            :full_mwt => chemblValue != nil ? chemblValue['full_mwt'] : nil,
            :full_mwt_src => chemblValue != nil ? chemblValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :full_mwt_item => chemblLinkOut,
            :hba => chemspiderValue != nil ? chemspiderValue['hba'] : nil,
            :hba_src => chemspiderValue != nil ? chemspiderValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :hba_item => chemspiderLinkOut,
            :hbd => chemspiderValue != nil ? chemspiderValue['hbd'] : nil,
            :hbd_src => chemspiderValue != nil ? chemspiderValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :hbd_item => chemspiderLinkOut,
            :molform => chemblValue != nil ? chemblValue['molform'] : nil,
            :molform_src => chemblValue != nil ? chemblValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :molform_item => chemblLinkOut,
            :mw_freebase => chemblValue != nil ? chemblValue['mw_freebase'] : nil,
            :mw_freebase_src => chemblValue != nil ? chemblValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :mw_freebase_item => chemblLinkOut,
            :psa => chemspiderValue != nil ? chemspiderValue['psa'] : nil,
            :psa_src => chemspiderValue != nil ? chemspiderValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :psa_item => chemspiderLinkOut,
            :rtb => chemblValue != nil ? chemblValue['rtb'] : nil,
            :rtb_src => chemblValue != nil ? chemblValue[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :rtb_item => chemblLinkOut,
            :biotransformation => drugBankData != nil ? drugBankData['biotransformation'] : nil,
            :biotransformation_src => drugBankData != nil ? drugBankData[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :biotransformation_item => drugbankLinkOut,
            :description => drugBankData != nil ? drugBankData['description'] : nil,
            :description_src => drugBankData != nil ? drugBankData[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :description_item => drugbankLinkOut,
            :proteinBinding => drugBankData != nil ? drugBankData['proteinBinding'] : nil,
            :proteinBinding_src => drugBankData != nil ? drugBankData[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :proteinBinding_item => drugbankLinkOut,
            :toxicity => drugBankData != nil ? drugBankData['toxicity'] : nil,
            :toxicity_src => drugBankData != nil ? drugBankData[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :toxicity_item => drugbankLinkOut,
            :compound_pref_label => pt['prefLabel'],
            :compound_pref_label_src => pt[Searcher::CompoundSearcher::LDA_IN_DATASET],
            :compound_pref_label_item => conceptWikiUri,
            :meltingPoint => drugBankData != nil ? drugBankData['meltingPoint'] : nil,
            :meltingPoint_src => drugBankData != nil ? drugBankData[Searcher::CompoundSearcher::LDA_IN_DATASET] : nil,
            :meltingPoint_item => drugbankLinkOut)
      return compound
    end
  end
end
