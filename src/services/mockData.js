// Mock data para desarrollo mientras el backend se implementa
export const mockData = {
  // Menu items - empty array (no test items)
  menuItems: [],

  // Categories
  categories: [
    {
      id: "cafe-clasico",
      name: "Café Clásico",
      description: "Cafés tradicionales",
      type: "bebidas",
      icon_url: null,
      allergen_ids: []
    },
    {
      id: "cafe-especial",
      name: "Café Especial",
      description: "Cafés gourmet",
      type: "bebidas",
      icon_url: null,
      allergen_ids: ["allergen1"]
    },
    {
      id: "bebidas-frias",
      name: "Bebidas Frías",
      description: "Bebidas refrescantes",
      type: "bebidas",
      icon_url: null,
      allergen_ids: []
    },
    {
      id: "snacks",
      name: "Snacks",
      description: "Aperitivos y bocadillos",
      type: "snack",
      icon_url: null,
      allergen_ids: ["allergen2", "allergen3"]
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

  // Allergens
  allergens: [
    {
      id: "allergen1",
      name: "Lactosa",
      description: "Contiene productos lácteos",
      icon_url: null
    },
    {
      id: "allergen2",
      name: "Gluten",
      description: "Contiene gluten",
      icon_url: null
    },
    {
      id: "allergen3",
      name: "Frutos Secos",
      description: "Contiene frutos secos",
      icon_url: null
    },
    {
      id: "allergen4",
      name: "Huevo",
      description: "Contiene huevo",
      icon_url: null
    },
    {
      id: "allergen5",
      name: "Soja",
      description: "Contiene soja",
      icon_url: null
    }
  ],

  // High scores
  highScores: [
    {
      id: "hs1",
      user_id: "user1",
      user_name: "Juan Pérez",
      game_id: "game1",
      game_name: "Café Quiz",
      high_score: 1500,
      achieved_at: "2024-01-01T00:00:00Z",
      idx_high_scores: 1
    },
    {
      id: "hs2",
      user_id: "user2",
      user_name: "María García",
      game_id: "game1",
      game_name: "Café Quiz",
      high_score: 1350,
      achieved_at: "2024-01-02T00:00:00Z",
      idx_high_scores: 2
    },
    {
      id: "hs3",
      user_id: "user3",
      user_name: "Carlos López",
      game_id: "game1",
      game_name: "Café Quiz",
      high_score: 1200,
      achieved_at: "2024-01-03T00:00:00Z",
      idx_high_scores: 3
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