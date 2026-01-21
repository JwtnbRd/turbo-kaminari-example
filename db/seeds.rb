# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create 20 posts for pagination testing
puts "Creating seed data..."

# Clear existing posts first
Post.destroy_all

20.times do |i|
  post = Post.create!(
    title: "Post #{i + 1}",
    status: [:confirmed, :unconfirmed].sample
  )
  puts post.inspect
end

puts "Created #{Post.count} posts"
