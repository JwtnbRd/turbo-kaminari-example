class Post < ApplicationRecord
  enum :status, {
    unconfirmed: 0,
    confirmed: 1
  }
end
