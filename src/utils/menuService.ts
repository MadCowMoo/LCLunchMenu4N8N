import axios from 'axios';
import { format } from 'date-fns';

import { Logger, createLogger } from './logger';

export interface MenuItem {
  categoryName: string;
  foodName: string;
  menuName?: string; // Optional menu name to identify which menu the item belongs to
}

export interface MenuDay {
  date: string; // ISO date string
  menuName: string;
  items: MenuItem[];
}

export interface ServingSession {
  id: string;
  name: string;
  days: MenuDay[];
}

export class MenuService {
  private readonly baseUrl = 'https://api.linqconnect.com/api/FamilyMenu';
  
  private logger: Logger;

  constructor(
    private readonly buildingId: string,
    private readonly districtId: string,
    logger?: Logger | any // Accept any logger-like object or use console as fallback
  ) {
    this.logger = createLogger(undefined, logger);
  }

  /**
   * Fetches menu data from the API
   * @param startDate Start date in MM-DD-YYYY format
   * @param endDate End date in MM-DD-YYYY format
   */
  async fetchMenuData(startDate?: Date, endDate?: Date): Promise<MenuDay[]> {
    const now = new Date();
    const defaultStartDate = format(now, 'MM-dd-yyyy');
    const defaultEndDate = format(
      new Date(now.setMonth(now.getMonth() + 1)),
      'MM-dd-yyyy'
    );

    const params = {
      buildingId: this.buildingId,
      districtId: this.districtId,
      startDate: startDate ? format(startDate, 'MM-dd-yyyy') : defaultStartDate,
      endDate: endDate ? format(endDate, 'MM-dd-yyyy') : defaultEndDate,
    };

    try {
      this.logger.debug('Fetching menu data', { params });
      const response = await axios.get(this.baseUrl, { params });
      this.logger.debug('Received menu data', { data: response.data });
      return this.parseRawMealData(response.data);
    } catch (error) {
      this.logger.error('Error fetching menu data', { error });
      throw error;
    }
  }

  /**
   * Parses raw JSON into structured menu data
   */
  async parseRawMealData(jsonData: any): Promise<MenuDay[]> {
    const menuDays: MenuDay[] = [];
    this.logger.debug('Parsing raw meal data');
    try {
      
      const familyMenuSessions = jsonData?.FamilyMenuSessions || [];

      (familyMenuSessions as any[]).reduce((sessions: ServingSession[], familySession: any) => {
        this.logger.debug('Processing family session', { session: familySession });
        const sessionId = familySession.ServingSessionId || 'default';
        const sessionName = familySession.ServingSession || 'Lunch';

        let session = sessions.find(s => s.id === sessionId);
        if (!session) {
          session = {
            id: sessionId,
            name: sessionName,
            days: [],
          };
          sessions.push(session);
        }

        const menuPlans = familySession.MenuPlans || [];

        menuPlans.forEach((plan: any) => {
          let planDayMealArray = plan.Days || [];
          // let planName = planDayMealArray.length > 0 ? plan.MenuPlanName : 'N/A';
          planDayMealArray.forEach((dayMeal: any) => {
            let mealDate = dayMeal.Date;
            let mealItems = dayMeal.MenuMeals;
            this.logger.debug('Processing meal items', { count: mealItems?.length });
            mealItems.forEach((meal: any) => {
              this.logger.debug('Processing meal', { meal });
              // let mealName = meal.RecipeName;
              // let mealFoodComponents = meal.FoodComponents;
              // let mealAllergens = meal.Allergens;
              let recipeCategories = meal.RecipeCategories;
              recipeCategories.forEach((category: any) => {
                let recipeCategoryName = category.CategoryName;
                let recipes = category.Recipes || [];
                recipes.forEach((recipe: any) => {
                  this.logger.debug('Processing recipe', { date: mealDate, recipe: recipe.RecipeName });
                  // Check if we already have an entry for this date and menu
                  const existingDayIndex = menuDays.findIndex(day => 
                    day.date === mealDate && day.menuName === sessionName
                  );
                  
                  let foodItemData: MenuItem = { 
                    categoryName: recipeCategoryName, 
                    foodName: recipe.RecipeName,
                    menuName: sessionName // Include the menu name with each item
                  };
                  if (existingDayIndex >= 0) {
                    // Add to existing day's items
                    menuDays[existingDayIndex].items.push(foodItemData);
                  } else {
                    // Create new day entry
                    menuDays.push({
                      date: mealDate,
                      menuName: sessionName,
                      items: [foodItemData],
                    });
                  }
                });
              });
            });
          });
        });

        this.logger.debug('Finished processing all days');

        return sessions;
      }, []);

      return menuDays;

    } catch (error) {
      console.error('Error parsing menu data:', error);
      throw new Error('Failed to parse menu data');
    }
  }

  /**
   * Gets menu items for a specific date and serving session
   */
  async getMenuForDate(targetDate: Date, _sessionId?: string): Promise<MenuItem[]> {
    let menusForDate: MenuItem[] = [];
    // Convert target date to local date string in YYYY-MM-DD format for comparison
    const targetDateStr = targetDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC' // Use UTC to avoid timezone issues
    }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
    
    const menuData = await this.fetchMenuData(targetDate, targetDate);
    this.logger.debug('Retrieved menu data for date', { 
      targetDate: targetDateStr,
      itemCount: menuData.length 
    });

    for (const menuDay of menuData) {
      // Skip if session ID is provided and doesn't match
      // if (sessionId && sessionId !== menuDay.menuName) continue;

      // Parse the date from the menu day (format: MM/DD/YYYY)
      const [month, day, year] = menuDay.date.split('/').map(Number);
      // Format to YYYY-MM-DD for comparison
      const menuDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      this.logger.debug('Matching menu day', { 
        menuDate: menuDay.date, 
        formattedMenuDate: menuDateStr, 
        targetDate: targetDateStr 
      });
      
      if (menuDateStr === targetDateStr) {
        this.logger.debug('Found matching menu day', { menuDay });
        menusForDate.push(...menuDay.items);
      }
    }
    return menusForDate;
  }
}
