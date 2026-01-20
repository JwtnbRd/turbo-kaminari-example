# frozen_string_literal: true

class Api::V1::Admin::TrainingsController < Api::V1::Admin::BaseController
  before_action :set_training, only: [:show, :update, :destroy]

  # GET /api/v1/admin/trainings
  def index
    @trainings = Training.all.order(:created_at)
    render json: @trainings.map { |training| serialize_training(training) }
  end

  # GET /api/v1/admin/trainings/:id
  def show
    render json: serialize_training(@training)
  end

  # POST /api/v1/admin/trainings
  def create
    @training = Training.new(training_params)

    if @training.save
      render json: serialize_training(@training), status: :created
    else
      render json: { errors: @training.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/admin/trainings/:id
  def update
    if @training.update(training_params)
      render json: serialize_training(@training)
    else
      render json: { errors: @training.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/admin/trainings/:id
  def destroy
    if @training.destroy
      render json: { message: 'Training deleted successfully' }, status: :ok
    else
      render json: { error: 'Failed to delete training' }, status: :unprocessable_entity
    end
  end

  private

  def set_training
    @training = Training.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Training not found' }, status: :not_found
  end

  def serialize_training(training)
    {
      id: training.id,
      name: training.name,
      description: training.description,
      duration: training.duration,
      base_points: training.base_points,
      difficulty: training.difficulty,
      published: training.published,
      created_at: training.created_at,
      updated_at: training.updated_at,
      training_records_count: training.training_records.count,
      formatted_duration: training.formatted_duration,
      difficulty_multiplier: training.difficulty_multiplier
    }
  end

  def training_params
    params.require(:training).permit(
      :name,
      :description,
      :duration,
      :base_points,
      :difficulty,
      :published
    )
  end
end