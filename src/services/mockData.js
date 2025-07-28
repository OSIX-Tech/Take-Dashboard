// Mock data para desarrollo mientras el backend se implementa
export const mockData = {
  // Menu items
  menuItems: [
    {
      id: 1,
      name: "Café Solo",
      description: "Café espresso tradicional",
      price: 1.30,
      category_id: "cafe-clasico",
      is_available: true,
      image_url: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      name: "Café con Leche",
      description: "Café con leche caliente",
      price: 1.80,
      category_id: "cafe-clasico",
      is_available: true,
      image_url: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 3,
      name: "Cappuccino",
      description: "Café con espuma de leche",
      price: 2.20,
      category_id: "cafe-especial",
      is_available: true,
      image_url: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  ],

  // Categories
  categories: [
    {
      id: "cafe-clasico",
      name: "Café Clásico",
      description: "Cafés tradicionales"
    },
    {
      id: "cafe-especial",
      name: "Café Especial",
      description: "Cafés gourmet"
    },
    {
      id: "bebidas-frias",
      name: "Bebidas Frías",
      description: "Bebidas refrescantes"
    }
  ],

  // Events
  events: [
    {
      id: 1,
      title: "Evento de Café",
      content: "Descripción del evento de café",
      image_url: "https://example.com/event.jpg",
      published_at: "2024-01-01T00:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  ],

  // Rewards
  rewards: [
    {
      id: 1,
      name: "Café Gratis",
      description: "Café gratis al acumular 10 sellos",
      required_seals: 10,
      image_url: "https://example.com/reward.jpg",
      created_at: "2024-01-01T00:00:00Z"
    }
  ],

  // Games
  games: [
    {
      id: 1,
      name: "Café Quiz",
      description: "Juego de preguntas sobre café"
    }
  ],

  // High scores
  highScores: [
    {
      id: 1,
      user_id: 1,
      game_id: 1,
      high_score: 1500,
      achieved_at: "2024-01-01T00:00:00Z",
      user: {
        name: "Juan Pérez",
        email: "juan@example.com"
      },
      game: {
        name: "Café Quiz"
      }
    }
  ],

  // Menu stats
  menuStats: {
    total_items: 52,
    available_items: 50,
    unavailable_items: 2,
    total_value: 142.85,
    average_price: 2.75,
    highest_price: 4.00,
    categories_count: 13
  },

  // Rewards stats
  rewardsStats: {
    total_users: 150,
    active_users: 120,
    total_seals: 2500,
    available_seals: 1800,
    users_ready_to_redeem: 25,
    average_seals_per_user: 16.67
  },

  // Game stats
  gameStats: {
    total_players: 85,
    active_players: 65,
    total_games: 3,
    average_score: 1250,
    highest_score: 2500
  }
}

// Función para simular delay de red
const simulateNetworkDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Función para simular respuesta exitosa
const createSuccessResponse = (data) => ({
  success: true,
  data: data
})

// Función para simular respuesta de error
const createErrorResponse = (message) => ({
  success: false,
  error: "Mock Error",
  message: message
})

export const mockApiService = {
  // Menu endpoints
  async getMenuItems() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.menuItems)
  },

  async getMenuItem(id) {
    await simulateNetworkDelay()
    const item = mockData.menuItems.find(item => item.id === parseInt(id))
    return item ? createSuccessResponse(item) : createErrorResponse("Item not found")
  },

  async getCategories() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.categories)
  },

  async getMenuStats() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.menuStats)
  },

  // Events endpoints
  async getEvents() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.events)
  },

  // Rewards endpoints
  async getRewards() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.rewards)
  },

  async getRewardsStats() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.rewardsStats)
  },

  // Games endpoints
  async getGames() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.games)
  },

  async getLeaderboard() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.highScores)
  },

  async getGameStats() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.gameStats)
  }
} 