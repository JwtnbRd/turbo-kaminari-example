class Training < ApplicationRecord
  # Enum
  enum :difficulty, { beginner: 0, intermediate: 1, advanced: 2 }, default: :beginner

  # Associations
  has_many :training_records, dependent: :destroy

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }, allow_blank: true
  validates :duration, presence: true, numericality: { greater_than: 0, less_than_or_equal_to: 3600 }
  validates :base_points, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1000 }
  validates :published, inclusion: { in: [true, false] }
  validates :difficulty, presence: true

  # Scopes
  scope :published, -> { where(published: true) }
  scope :unpublished, -> { where(published: false) }
  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
  scope :for_user_level, ->(user_level) {
    case user_level
    when 'beginner'
      where(difficulty: [:beginner])
    when 'intermediate'
      where(difficulty: [:beginner, :intermediate])
    when 'advanced'
      where(difficulty: [:beginner, :intermediate, :advanced])
    else
      where(difficulty: [:beginner])
    end
  }
  scope :recent, ->(limit = 10) { order(created_at: :desc).limit(limit) }
  scope :popular, -> { joins(:training_records).group('trainings.id').order('COUNT(training_records.id) DESC') }
  scope :short_duration, -> { where('duration <= 30') }
  scope :medium_duration, -> { where('duration BETWEEN 31 AND 60') }
  scope :long_duration, -> { where('duration > 60') }

  # Instance methods
  def calculate_points(user_performance = 1.0)
    (base_points * difficulty_multiplier * user_performance).round
  end

  def difficulty_multiplier
    case difficulty
    when 'beginner'
      1.0
    when 'intermediate'
      1.5
    when 'advanced'
      2.0
    else
      1.0
    end
  end

  def available_for_user?(user_level = 'beginner')
    return false unless published

    case user_level
    when 'beginner'
      difficulty == 'beginner'
    when 'intermediate'
      difficulty.in?(['beginner', 'intermediate'])
    when 'advanced'
      true
    else
      difficulty == 'beginner'
    end
  end

  def duration_category
    return 'short' if duration <= 30
    return 'medium' if duration <= 60
    'long'
  end

  def formatted_duration
    minutes = duration / 60
    seconds = duration % 60

    if minutes > 0 && seconds > 0
      "#{minutes}分#{seconds}秒"
    elsif minutes > 0
      "#{minutes}分"
    else
      "#{seconds}秒"
    end
  end

  def can_be_completed_by?(user)
    return false unless published
    return false if user.blank?

    # ユーザーレベルに応じた制限
    user_level = user.respond_to?(:level) ? user.level : 'beginner'
    available_for_user?(user_level)
  end

  def average_completion_time
    completed_records = training_records.where.not(completed_at: nil)
    return 0 if completed_records.empty?

    total_time = completed_records.sum do |record|
      record.completed_at - record.created_at
    end

    (total_time / completed_records.count).round
  end

  def completion_rate
    total_records = training_records.count
    return 0 if total_records.zero?

    completed_records = training_records.where.not(completed_at: nil).count
    ((completed_records.to_f / total_records) * 100).round(1)
  end

  # Class methods
  def self.by_points_range(min_points, max_points)
    where(base_points: min_points..max_points)
  end

  def self.suitable_for_time(available_minutes)
    where('duration <= ?', available_minutes * 60)
  end

  def self.recommended_for_user(user)
    return published.by_difficulty('beginner') if user.blank?

    user_level = user.respond_to?(:level) ? user.level : 'beginner'
    published.for_user_level(user_level).order(:difficulty, :duration)
  end
end