class TrainingRecord < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :training

  # Validations
  validates :points_earned, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :completed_at, presence: true
  validates :reps, numericality: { greater_than: 0, allow_nil: true }
  validates :duration, numericality: { greater_than: 0, allow_nil: true }
  validates :weight, numericality: { greater_than: 0, allow_nil: true }

  validate :completed_at_not_future
  validate :daily_training_limit

  # Callbacks
  before_save :calculate_and_set_points
  after_create :update_user_stats

  # Scopes
  scope :recent, ->(days = 7) { where('completed_at >= ?', days.days.ago).order(completed_at: :desc) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :by_date, ->(date) { where(completed_at: date.beginning_of_day..date.end_of_day) }
  scope :by_training, ->(training_id) { where(training_id: training_id) }
  scope :this_week, -> { where('completed_at >= ?', Date.current.beginning_of_week) }
  scope :this_month, -> { where('completed_at >= ?', Date.current.beginning_of_month) }
  scope :ordered, -> { order(completed_at: :desc) }

  # Instance methods
  def calculate_points
    return 0 unless training&.base_points

    base = training.base_points
    difficulty_bonus = training.difficulty_multiplier || 1.0

    (base * difficulty_bonus).round
  end

  def same_day_same_training_count
    TrainingRecord.by_date(completed_at.to_date)
                  .by_training(training_id)
                  .by_user(user_id)
                  .count
  end

  def performance_ratio
    return nil unless reps && training.base_reps

    reps.to_f / training.base_reps
  end

  private

  def completed_at_not_future
    return unless completed_at

    errors.add(:completed_at, 'cannot be in the future') if completed_at > Time.current
  end

  def calculate_and_set_points
    self.points_earned = calculate_points if points_earned.blank? || points_earned.zero?
  end

  def update_user_stats
    user.user_stat.recalculate!
  end

  def daily_training_limit
    return unless completed_at && user_id

    # 今日の日付の範囲
    today_start = completed_at.to_date.beginning_of_day
    today_end = completed_at.to_date.end_of_day

    # 今日の既存レコード数（自分を除く）
    existing_count = TrainingRecord.where(
      user_id: user_id,
      completed_at: today_start..today_end
    ).where.not(id: id).count

    errors.add(:base, '1日のトレーニング上限は3回です') if existing_count >= 3
  end
end