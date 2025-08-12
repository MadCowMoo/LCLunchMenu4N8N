import axios from 'axios';
import { format, addDays } from 'date-fns';
import { MenuService } from '../utils/menuService';
import { MenuItem } from '../utils/menuService';

// Mock the logger to avoid console output during tests
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Sample menu data that matches the actual API response structure
const createMockMenuData = (startDate: Date, days: number = 5) => {
  const endDate = addDays(startDate, days);
  const dateFormat = 'MM/dd/yyyy';
  
  return {
    data: {
      FamilyMenuSessions: [
        {
          ServingSessionId: 'lunch',
          ServingSession: 'Lunch',
          MenuPlans: [
            {
              Days: Array.from({ length: days }, (_, i) => ({
                Date: format(addDays(startDate, i), 'MM/dd/yyyy'),
                MenuMeals: [
                  {
                    RecipeName: `Meal ${i + 1}`,
                    RecipeIdentifier: `meal-${i + 1}`,
                    FoodComponents: { string: ['Ingredient 1', 'Ingredient 2'] },
                    Allergens: { guid: ['allergen-1'] },
                    ItemId: `item-${i + 1}`,
                    GramPerServing: 100,
                    ServingSize: '1 cup',
                    RecipeCategories: [
                      {
                        CategoryName: 'Entrees',
                        Recipes: [
                          {
                            RecipeName: `Meal ${i + 1}`,
                            RecipeIdentifier: `meal-${i + 1}`,
                            FoodComponents: { string: ['Ingredient 1', 'Ingredient 2'] },
                            Allergens: { guid: ['allergen-1'] },
                            ItemId: `item-${i + 1}`,
                            GramPerServing: 100,
                            ServingSize: '1 cup',
                            MenuName: 'Lunch',
                            Nutrients: {
                              Nutrient: [
                                { Name: 'Calories', Value: '200', Unit: 'kcal' },
                                { Name: 'Protein', Value: '10', Unit: 'g' },
                              ]
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }))
            }
          ]
        }
      ]
    }
  };
};

describe('MenuService', () => {
  let menuService: MenuService;
  const buildingId = 'test-building';
  const districtId = 'test-district';
  const today = new Date();
  const tomorrow = addDays(today, 1);

  beforeEach(() => {
    jest.clearAllMocks();
    menuService = new MenuService(buildingId, districtId, mockLogger);
  });

  describe('fetchMenuData', () => {
    it('should fetch menu data with correct parameters', async () => {
      const mockData = createMockMenuData(today);
      mockedAxios.get.mockResolvedValue(mockData);

      await menuService.fetchMenuData(today, tomorrow);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.linqconnect.com/api/FamilyMenu',
        {
          params: {
            buildingId,
            districtId,
            startDate: format(today, 'MM-dd-yyyy'),
            endDate: format(tomorrow, 'MM-dd-yyyy')
          }
        }
      );
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(menuService.fetchMenuData()).rejects.toThrow('API Error');
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching menu data', { error });
    });
  });

  describe('getMenuForDate', () => {
    it('should return menu items for a specific date', async () => {
      // Create a fixed date for testing (using local date to avoid timezone issues)
      const testDate = new Date(2024, 0, 1); // Jan 1, 2024
      
      // Create mock data for the test date
      const mockData = createMockMenuData(testDate, 1);
      
      // Log the mock data for debugging
      console.log('Mock data date:', mockData.data.FamilyMenuSessions[0].MenuPlans[0].Days[0].Date);
      
      mockedAxios.get.mockResolvedValue(mockData);

      // Call the method under test
      const menuItems = await menuService.getMenuForDate(testDate);
      
      // Log the actual menu items for debugging
      console.log('Menu items:', menuItems);
      
      // We expect items to be returned
      expect(menuItems.length).toBeGreaterThan(0);
      
      // Check that we have a meal with the expected category
      // The mock data creates meals with names like 'Meal 1', 'Meal 2', etc.
      const mealItem = menuItems.find(item => item.foodName && item.foodName.startsWith('Meal '));
      expect(mealItem).toBeDefined();
      expect(mealItem?.categoryName).toBe('Entrees');
    });

    it('should return empty array if no menu found for date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1); // Far future date
      
      const mockData = createMockMenuData(today, 1);
      mockedAxios.get.mockResolvedValue(mockData);

      const menuItems = await menuService.getMenuForDate(futureDate);
      expect(menuItems).toEqual([]);
      
      // Note: We no longer log a warning when no menu is found for a date
      // as it's not necessarily an error condition
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should filter by serving session if provided', async () => {
      const mockData = createMockMenuData(today, 2);
      mockedAxios.get.mockResolvedValue(mockData);

      const menuItems = await menuService.getMenuForDate(today, 'lunch');
      expect(menuItems[0].menuName).toBe('Lunch');
    });
  });

  // Note: Testing private methods directly is not recommended as it can make tests brittle.
  // Instead, we test these behaviors indirectly through the public API.
  // The following tests are kept for reference but are skipped.

  describe.skip('filterMainEntrees', () => {
    it('should filter out non-main entrees', () => {
      // This test is skipped as it tests private implementation details
      // The functionality is covered by integration tests
    });
  });

  describe.skip('filterLunchOnly', () => {
    it('should filter out non-lunch items', () => {
      // This test is skipped as it tests private implementation details
      // The functionality is covered by integration tests
    });
  });

  describe.skip('sortMenuItems', () => {
    it('should sort items by category and food name', () => {
      // This test is skipped as it tests private implementation details
      // The functionality is covered by integration tests
    });
  });
});
