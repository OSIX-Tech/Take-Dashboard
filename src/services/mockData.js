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

  // Events - Empty array to use real API data
  events: [],

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
  ]
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

  // Events endpoints - Returns empty array to force real API usage
  async getEvents() {
    await simulateNetworkDelay()
    return createSuccessResponse([])
  },

  // Rewards endpoints
  async getRewards() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.rewards)
  },

  // Games endpoints
  async getGames() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.games)
  },

  async getLeaderboard() {
    await simulateNetworkDelay()
    return createSuccessResponse(mockData.highScores)
  }
} 