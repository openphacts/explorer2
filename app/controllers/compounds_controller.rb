class CompoundsController < ApplicationController

  def show
    #searcher = Searcher::CompoundSearcher.new
    #uri = 'http://www.conceptwiki.org/concept/' + params[:id]
    #result = searcher.search uri
    #puts result
    #@compound = searcher.parse_compound(result)
    #respond_to do |format|
    #  format.html { render 'home/index' }
    #  format.json { render json: {:compound=> @compound} }
    #end
    respond_to do |format|
      format.html { render 'home/index' }
      format.json { render :json => { :compound => @compound } }
      format.any  { render :text => "only HTML and JSON format are supported at the moment." }
    end
  end

  def pharmacology
    respond_to do |format|
      format.html { render 'home/index' }
    end
  end

  def structure
    respond_to do |format|
      format.html { render 'home/index' }
    end
  end

end
