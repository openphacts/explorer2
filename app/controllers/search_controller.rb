require 'csv'

class SearchController < ApplicationController

  # Given a query string search the list of compounds
  # and targets for matches. Only matches the start of
  # the prefLabel
  def typeahead
    puts "inside typeahead"
    results = []
    File.open(File.join(Rails.root, "filestore", "compounds.txt")).each do |row|
       if row.downcase.starts_with? params[:query].downcase
         results.push(row) 
       end
    end
    File.open(File.join(Rails.root, "filestore", "targets.txt")).each do |row|
       if row.downcase.starts_with? params[:query].downcase
         results.push(row) 
       end
    end
    # shuffle the results so that compounds and targets get mixed up since we
    # are not doing any relevancy matches
    results.shuffle
    respond_to do |format|
      format.json { render :json => results }
    end

  end

  def typeaheadCompounds
    results = []
    File.open(File.join(Rails.root, "filestore", "compounds.txt")).each do |row|
       if row.downcase.starts_with? params[:query].downcase
         results.push(row) 
       end
    end
     # shuffle the results so that compounds and targets get mixed up since we
    # are not doing any relevancy matches
    results.shuffle
    respond_to do |format|
      format.json { render :json => results }
    end

  end
  
    def typeaheadTargets
    results = []

    File.open(File.join(Rails.root, "filestore", "targets.txt")).each do |row|
       if row.downcase.starts_with? params[:query].downcase
         results.push(row) 
       end
    end
    # shuffle the results so that compounds and targets get mixed up since we
    # are not doing any relevancy matches
    results.shuffle
    respond_to do |format|
      format.json { render :json => results }
    end

  end
  
  def index
    @query = params[:query]
    limit = params[:limit]
    @concepts = find_compounds @query, limit
    #@targets = find_targets query
    #@enzymes = find_enzymes query
    puts "concepts " + @concepts.size.to_s
    respond_to do |format|
      format.html { render :html => "home/index" }
      format.json { render :json => @concepts}
    end

  end

  def compound_info
    searcher = Searcher::CompoundSearcher.new
    @compound = searcher.parse_compound(searcher.search params[:uri])
    respond_to do |format|
      format.html { render :partial => "compounds/compound.html.erb" }
      format.json { render :json => @compound }
    end
  end

  def find_compounds query, limit
    concept_wiki_searcher = Searcher::ConceptWikiSearcher.new
    concept_search_result = concept_wiki_searcher.search query, "4", "07a84994-e464-4bbf-812a-a4b96fa3d197", limit
    concepts = concept_wiki_searcher.parse_concepts concept_search_result
    return concepts
    #searcher = Searcher::CompoundSearcher.new
    #compounds = []
    #concepts.each do |concept|
    #  compounds.push(searcher.parse_compound(searcher.search concept.ops_uri))
    #end
    #return compounds
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
