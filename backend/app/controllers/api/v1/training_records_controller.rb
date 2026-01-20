class Api::V1::TrainingRecordsController < Api::V1::BaseController
  before_action :authenticate_user
  before_action :set_training_record, only: [:show, :update, :destroy]

  # GET /api/v1/training_records
  def index
    @training_records = current_user.training_records
                                   .includes(:training)
                                   .ordered

    # フィルタリング
    @training_records = @training_records.by_training(params[:training_id]) if params[:training_id].present?
    @training_records = @training_records.where(completed_at: params[:start_date].to_date.beginning_of_day..params[:end_date].to_date.end_of_day) if params[:start_date].present? && params[:end_date].present?

    # ページネーション（シンプル版）
    page = (params[:page] || 1).to_i
    per_page = (params[:per_page] || 20).to_i
    offset = (page - 1) * per_page

    total_count = @training_records.count
    @training_records = @training_records.limit(per_page).offset(offset)
    total_pages = (total_count.to_f / per_page).ceil

    render json: {
      data: @training_records.map do |record|
        {
          id: record.id,
          training_id: record.training_id,
          training_name: record.training.name,
          reps: record.reps,
          duration: record.duration,
          weight: record.weight,
          notes: record.notes,
          points: record.points_earned,
          completed_at: record.completed_at,
          created_at: record.created_at
        }
      end,
      meta: {
        current_page: page,
        total_pages: total_pages,
        total_count: total_count,
        per_page: per_page
      }
    }
  end

  # POST /api/v1/training_records
  def create
    @training_record = current_user.training_records.build(training_record_params)
    @training_record.completed_at ||= Time.current

    if @training_record.save
      render json: {
        id: @training_record.id,
        training_id: @training_record.training_id,
        training_name: @training_record.training.name,
        reps: @training_record.reps,
        duration: @training_record.duration,
        weight: @training_record.weight,
        notes: @training_record.notes,
        points: @training_record.points_earned,
        completed_at: @training_record.completed_at,
        created_at: @training_record.created_at
      }, status: :created
    else
      render json: { errors: @training_record.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/training_records/:id
  def show
    render json: {
      id: @training_record.id,
      training_id: @training_record.training_id,
      training_name: @training_record.training.name,
      reps: @training_record.reps,
      duration: @training_record.duration,
      weight: @training_record.weight,
      notes: @training_record.notes,
      points: @training_record.points_earned,
      completed_at: @training_record.completed_at,
      created_at: @training_record.created_at,
      performance_ratio: @training_record.performance_ratio,
      same_day_count: @training_record.same_day_same_training_count
    }
  end

  # PATCH/PUT /api/v1/training_records/:id
  def update
    if @training_record.update(training_record_params)
      render json: {
        id: @training_record.id,
        training_id: @training_record.training_id,
        training_name: @training_record.training.name,
        reps: @training_record.reps,
        duration: @training_record.duration,
        weight: @training_record.weight,
        notes: @training_record.notes,
        points: @training_record.points_earned,
        completed_at: @training_record.completed_at,
        updated_at: @training_record.updated_at
      }
    else
      render json: { errors: @training_record.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/training_records/:id
  def destroy
    @training_record.destroy
    head :no_content
  end

  private

  def set_training_record
    @training_record = current_user.training_records.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Training record not found' }, status: :not_found
  end

  def training_record_params
    params.require(:training_record).permit(
      :training_id,
      :reps,
      :duration,
      :weight,
      :notes,
      :completed_at
    )
  end
end