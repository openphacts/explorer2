require 'cgi'
require 'net/http'
require 'compound_searcher'
require 'concept_wiki_searcher'

module Searcher

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

  class TargetSearcher

    def search query

    end

  end

  class EnzymeSearcher

    def search query

    end

  end

end
