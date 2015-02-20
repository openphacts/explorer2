namespace :explorer do
  desc "Load all compound, target and organism models into the database"
  task :load_all_assets => :environment do
    load_compounds
    load_targets
    load_organisms
  end
  
  def load_compounds
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
    # and the remaining <1000 compounds
    Compound.import([:label], compounds)
    puts "Imported compounds"
  end

  def load_targets
    targets_file = File.new(File.join(Rails.root, "filestore", "targets.txt"), "r")
    targets_file.each_line do |line|
      t = Target.new
      t.label = line.chomp
      t.save
      puts "Target: " + t.label
    end
  end
  
  def load_organisms
    organisms_file = File.new(File.join(Rails.root, "filestore", "organisms.txt"), "r")
    organisms_file.each_line do |line|
      o = Organism.new
      o.label = line.chomp
      o.save
      puts "Organism: " + o.label
    end
  end
end
