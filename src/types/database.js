// Database types based on Supabase schema

// Categories table
export const Category = {
  id: 'uuid',
  name: 'text',
  description: 'text',
  created_at: 'timestamp'
}

// Events table
export const Event = {
  id: 'uuid',
  title: 'text',
  content: 'text',
  image_url: 'text', // optional
  published_at: 'timestamp'
}

// Users table
export const User = {
  id: 'uuid',
  name: 'text',
  email: 'text',
  phone: 'text',
  google_id: 'text UNIQUE',
  jwt_secure_code: 'text',
  created_at: 'timestamp'
}

// Menu items table
export const MenuItem = {
  id: 'uuid',
  name: 'text',
  description: 'text',
  price: 'decimal',
  image_url: 'text',
  category_id: 'uuid FK', // references categories.id
  is_available: 'bool'
}

// Rewards table
export const Reward = {
  id: 'uuid',
  name: 'text',
  description: 'text',
  required_seals: 'int',
  image_url: 'text', // optional
  created_at: 'timestamp'
}

// High scores table
export const HighScore = {
  id: 'uuid',
  user_id: 'uuid FK', // references users.id
  game_id: 'uuid FK', // references games.id
  high_score: 'integer',
  achieved_at: 'timestamp'
}

// Apple wallet table
export const AppleWallet = {
  user_id: 'uuid PK/FK', // references users.id
  total_seals: 'int',
  current_seals: 'int',
  max_seals: 'int'
}

// Google wallet table
export const GoogleWallet = {
  user_id: 'uuid PK/FK', // references users.id
  total_seals: 'int',
  current_seals: 'int',
  max_seals: 'int'
}

// Games table
export const Game = {
  id: 'uuid',
  name: 'text',
  description: 'text'
}

// Extended types with relationships
export const MenuItemWithCategory = {
  ...MenuItem,
  category: Category
}

export const HighScoreWithUserAndGame = {
  ...HighScore,
  user: User,
  game: Game
}

export const UserWithWallets = {
  ...User,
  apple_wallet: AppleWallet,
  google_wallet: GoogleWallet
} 