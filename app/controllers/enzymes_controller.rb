class TreesController < ApplicationController

#  def show
#    respond_to do |format|
#      format.html { render 'home/index' }
#    end
#  end

  def pharmacology
    respond_to do |format|
      format.html { render 'home/index' }
    end
  end
  
  def index
    respond_to do |format|
      format.html { render 'home/index' }
    end
  end

end
