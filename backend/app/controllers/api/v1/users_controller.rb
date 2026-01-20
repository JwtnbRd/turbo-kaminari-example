class Api::V1::UsersController < Api::V1::BaseController
  before_action :authenticate_user

  # GET /api/v1/users/dashboard_stats
  def dashboard_stats
    stats = current_user.calculate_dashboard_stats
    render json: { dashboard_stats: stats }
  rescue StandardError => e
    Rails.logger.error "Dashboard stats calculation failed: #{e.message}"
    render json: { error: 'Failed to calculate dashboard stats' }, status: :internal_server_error
  end

  # GET /api/v1/users/training_trends
  def training_trends
    trends = current_user.calculate_training_trends
    render json: { training_trends: trends }
  rescue StandardError => e
    Rails.logger.error "Training trends calculation failed: #{e.message}"
    render json: { error: 'Failed to calculate training trends' }, status: :internal_server_error
  end
end