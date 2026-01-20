class Api::V1::TrainingsController < Api::V1::BaseController
  skip_before_action :authenticate_user, only: [:index, :show]

  def index
    # published: true を先に、false を後に表示
    trainings = Training.order(published: :desc, id: :asc)

    render json: trainings.map { |training|
      {
        id: training.id,
        name: training.name,
        description: training.description,
        duration: training.duration,
        base_points: training.base_points,
        difficulty: training.difficulty,
        published: training.published,
        explain: training.explain || [],
        points: training.calculate_points,
        difficulty_multiplier: training.difficulty_multiplier
      }
    }
  end

  def show
    training = Training.published.find(params[:id])

    render json: {
      id: training.id,
      name: training.name,
      description: training.description,
      duration: training.duration,
      base_points: training.base_points,
      difficulty: training.difficulty,
      points: training.calculate_points,
      difficulty_multiplier: training.difficulty_multiplier
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Training not found' }, status: :not_found
  end
end