class KetcherController < ApplicationController

  def index

  end
  
  def knocknock

    port = AppSettings.config["ketcher"]["port"]
    domain = "localhost"
    path= "knocknock"
    response = Net::HTTP.get(domain, path, port)
    if response == "You are welcome!"
      render text: response
    else
      render text: "Failed"
    end 

  end

  def layout
    smiles = params[:smiles]
    port = AppSettings.config["ketcher"]["port"]
    domain = "localhost"
    path= "layout?smiles=" + smiles
    response = Net::HTTP.get(domain, path, port)
    if response.start_with? "Ok"
      render text: response
    else
      render text: "Failed"
    end 

  end

end
