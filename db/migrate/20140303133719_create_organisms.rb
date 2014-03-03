class CreateOrganisms < ActiveRecord::Migration
  def up
   create_table :organisms do |t|
      t.string :label
 
      t.timestamps
    end
  end

  def down
    drop_table :organisms
  end
end
