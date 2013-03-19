class CompoundsController < ApplicationController

  def show
    searcher = Searcher::CompoundSearcher.new
    uri = 'http://www.conceptwiki.org/concept/' + params[:id]
    result = searcher.search uri
    puts result
    @compound = searcher.parse_compound(result)
    render json: {:compound=> @compound}
  end

end
