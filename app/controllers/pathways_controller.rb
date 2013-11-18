class PathwaysController < ApplicationController

  def show
    respond_to do |format|
      format.html { render 'home/index' }
      format.any  { render :text => "only HTML is supported at the moment." }
    end
  end

end
