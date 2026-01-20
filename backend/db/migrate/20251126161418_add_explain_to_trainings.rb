class AddExplainToTrainings < ActiveRecord::Migration[8.0]
  def change
    add_column :trainings, :explain, :text, array: true, default: []
  end
end
