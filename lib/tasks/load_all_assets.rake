namespace :explorer do
  desc "Load all compound, target and organism models into the database"
  task :load_all_assets => :environment do
    load_compounds
    load_targets
    load_organisms
  end
  
  def load_compounds
    puts "Compounds"
    compounds = []
    compounds_file = File.new(File.join(Rails.root, "filestore", "compounds.txt"), "r")    
    compounds_file.each_line do |line|
      compounds << [line.chomp]
      if compounds.length > 10000 then
        Compound.import([:label], compounds)
        compounds = []
        print "."
      end
    end
    # and the remaining compounds
    Compound.import([:label], compounds)
    puts ""
  end

  def load_targets
    puts "Targets"
    targets = []
    targets_file = File.new(File.join(Rails.root, "filestore", "targets.txt"), "r")
    targets_file.each_line do |line|
      targets << [line.chomp]
    end
    Target.import([:label], targets)
  end
  
  def load_organisms
    puts "Organisms"
    organisms = []
    organisms_file = File.new(File.join(Rails.root, "filestore", "organisms.txt"), "r")
    organisms_file.each_line do |line|
      organisms << [line.chomp]
    end
    Organism.import([:label], organisms)
  end
end
