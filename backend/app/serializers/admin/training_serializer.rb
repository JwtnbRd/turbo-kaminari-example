# frozen_string_literal: true

class Admin::TrainingSerializer
  def initialize(training)
    @training = training
  end

  def as_json
    {
      id: @training.id,
      name: @training.name,
      description: @training.description,
      duration: @training.duration,
      base_points: @training.base_points,
      difficulty: @training.difficulty,
      published: @training.published,
      created_at: @training.created_at,
      updated_at: @training.updated_at,
      training_records_count: @training.training_records.count,
      formatted_duration: @training.formatted_duration,
      difficulty_multiplier: @training.difficulty_multiplier
    }
  end
end