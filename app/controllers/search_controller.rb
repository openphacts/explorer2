class SearchController < ApplicationController

  def index
    query = params[:query]
    limit = params[:limit]
    @compounds = find_compounds query, limit
    #@targets = find_targets query
    #@enzymes = find_enzymes query
  end

  def find_compounds query, limit
    concept_wiki_searcher = Searcher::ConceptWikiSearcher.new
    concept_search_result = concept_wiki_searcher.search query, "4", "07a84994-e464-4bbf-812a-a4b96fa3d197", limit
    concepts = concept_wiki_searcher.parse_concepts concept_search_result
    searcher = Searcher::CompoundSearcher.new
    compounds = []
    concepts.each do |concept|
      compounds.push(searcher.parse_compound(searcher.search concept.ops_uri))
    end
    return compounds
  end

  def find_targets query

    searcher = Searcher::TargetSearcher.new
    results = searcher.search query

  end

  def find_enzymes query

    searcher = Searcher::EnzymeSearcher.new
    results = searcher.search query

  end

  def free_text

  end

end
