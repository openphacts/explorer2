module ApplicationHelper

  def get_lenses
    lenses = []
    lenses.push({
      :name => "Stereochemistry",
      :uri => "/QueryExpander/Lens/stereochemistry",
      :description => "Default Lens plus the Stereochemistry linksets"
    }) 
    lenses.push({
      :name => "Isotope",
      :uri => "/QueryExpander/Lens/isotope",
      :description => "Default Lens plus the Isotope linksets"
    })
    lenses.push({
      :name => "Tautomer",
      :uri => "/QueryExpander/Lens/tautomer",
      :description => "Default Lens plus the Tautomer linksets"
    })
    lenses.push({
      :name => "Default CW",
      :uri => "/QueryExpander/Lens/DefaultCW",
      :description => "Default Lens plus transitives via ConcepWiki"
    })
    lenses.push({
      :name => "Default plus Charge",
      :uri => "/QueryExpander/Lens/charge",
      :description => "Default Lens plus the Charge linksets"
    })
    return lenses
  end

end
