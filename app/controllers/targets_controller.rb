class TargetsController < ApplicationController

  def show
    #searcher = Searcher::TargetSearcher.new
    #uri = 'http://www.conceptwiki.org/concept/' + params[:id]
    #result = searcher.search uri
    #puts result
    #@target = searcher.parse_target(result)
    respond_to do |format|
      format.html { render 'home/index' }
      #format.json { render :json => { :target => @target } }
      format.any  { render :text => "only HTML and JSON format are supported at the moment." }
    end
  end

  def pharmacology
    respond_to do |format|
      format.html { render 'home/index' }
    end
  end

end
